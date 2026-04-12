const prisma = require('../config/db');
const { debitWallet } = require('./wallet.service');

const createApplication = async (userId, planId, paymentReference) => {
  const plan = await prisma.livestockPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error('Plan not found');
  }
  if (plan.status !== 'active') {
    throw new Error('Cannot apply for an inactive plan');
  }

  // If a payment reference is provided, we use the legacy manual/direct payment flow
  if (paymentReference) {
    const payment = await prisma.payment.findUnique({
      where: { reference: paymentReference }
    });

    if (!payment || payment.userId !== userId) {
      throw new Error('Invalid payment reference');
    }

    if (payment.applicationId) {
      throw new Error('This payment has already been used for another application');
    }

    const application = await prisma.application.create({
      data: {
        userId,
        planId,
        paymentStatus: payment.status === 'success' ? 'paid' : 'unpaid',
        amountInvested: payment.status === 'success' ? plan.price : 0,
        expectedRoiAmount: payment.status === 'success' ? (plan.price * (plan.roiPercentage || 20)) / 100 : 0
      }
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { applicationId: application.id }
    });

    return application;
  }

  // Wallet-based investment (New primary flow)
  // We use debitWallet which handles the transaction and balance check
  await debitWallet(userId, plan.price);

  const application = await prisma.application.create({
    data: {
      userId,
      planId,
      paymentStatus: 'paid',
      amountInvested: plan.price,
      expectedRoiAmount: (plan.price * (plan.roiPercentage || 20)) / 100
    }
  });

  return application;
};

const getApplications = async (query = {}) => {
  return await prisma.application.findMany({
    where: query,
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true
        }
      },
      plan: true
    }
  });
};

const getApplicationById = async (id) => {
  const application = await prisma.application.findUnique({
    where: { id },
    include: { plan: true }
  });
  
  if (!application) {
    throw new Error('Application not found');
  }
  return application;
};

const updateApplicationStatus = async (id, status) => {
  try {
    const data = { status };
    
    if (status === 'approved') {
       const app = await prisma.application.findUnique({ where: { id }, include: { plan: true } });
       if (app && app.plan) {
          let maturityDate = new Date();
          let durationStr = app.plan.duration || '';
          let monthsMatch = durationStr.match(/(\d+)\s*month/i);
          let daysMatch = durationStr.match(/(\d+)\s*day/i);

          if (monthsMatch) {
             maturityDate.setMonth(maturityDate.getMonth() + parseInt(monthsMatch[1], 10));
          } else if (daysMatch) {
             maturityDate.setDate(maturityDate.getDate() + parseInt(daysMatch[1], 10));
          } else {
             maturityDate.setMonth(maturityDate.getMonth() + 6);
          }
          data.maturityDate = maturityDate;
       }
    }

    const application = await prisma.application.update({
      where: { id },
      data
    });
    return application;
  } catch (error) {
    if (error.code === 'P2025') {
       throw new Error('Application not found');
    }
    throw error;
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus
};

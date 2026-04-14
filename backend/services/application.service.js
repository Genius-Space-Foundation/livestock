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

  // Calculate maturity date unconditionally based on plan duration
  let maturityDate = new Date();
  let durationStr = plan.duration || '';
  let monthsMatch = durationStr.match(/(\d+)\s*month/i);
  let daysMatch = durationStr.match(/(\d+)\s*day/i);

  if (monthsMatch) {
     maturityDate.setMonth(maturityDate.getMonth() + parseInt(monthsMatch[1], 10));
  } else if (daysMatch) {
     maturityDate.setDate(maturityDate.getDate() + parseInt(daysMatch[1], 10));
  } else {
     maturityDate.setMonth(maturityDate.getMonth() + 6);
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

    const isPaid = payment.status === 'success';
    const application = await prisma.application.create({
      data: {
        userId,
        planId,
        status: isPaid ? 'approved' : 'pending',
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        amountInvested: isPaid ? plan.price : 0,
        expectedRoiAmount: isPaid ? (plan.price * (plan.roiPercentage || 20)) / 100 : 0,
        maturityDate: isPaid ? maturityDate : null
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
      status: 'approved',
      paymentStatus: 'paid',
      amountInvested: plan.price,
      expectedRoiAmount: (plan.price * (plan.roiPercentage || 20)) / 100,
      maturityDate
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

const reinvestApplication = async (applicationId, userId) => {
  const oldApp = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { plan: true }
  });

  if (!oldApp) throw new Error('Application not found');
  if (oldApp.userId !== userId) throw new Error('Unauthorized');
  
  if (oldApp.status !== 'approved' || oldApp.paymentStatus !== 'paid') {
    throw new Error('Application is not eligible for reinvestment');
  }

  const now = new Date();
  if (!oldApp.maturityDate || now < oldApp.maturityDate) {
    throw new Error('Application is not yet matured');
  }

  if (oldApp.withdrawalStatus !== 'not_requested') {
    throw new Error('Application has already been withdrawn or reinvested');
  }

  const totalReturn = (oldApp.amountInvested || 0) + (oldApp.expectedRoiAmount || 0);
  const newExpectedRoi = (totalReturn * (oldApp.plan.roiPercentage || 20)) / 100;

  // Compute maturity date for new app (auto approved)
  let maturityDate = new Date();
  let durationStr = oldApp.plan.duration || '';
  let monthsMatch = durationStr.match(/(\d+)\s*month/i);
  let daysMatch = durationStr.match(/(\d+)\s*day/i);

  if (monthsMatch) {
     maturityDate.setMonth(maturityDate.getMonth() + parseInt(monthsMatch[1], 10));
  } else if (daysMatch) {
     maturityDate.setDate(maturityDate.getDate() + parseInt(daysMatch[1], 10));
  } else {
     maturityDate.setMonth(maturityDate.getMonth() + 6);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Mark old application as reinvested
    await tx.application.update({
      where: { id: applicationId },
      data: { withdrawalStatus: 'reinvested' }
    });

    // 2. Create the new compounded application
    const newApp = await tx.application.create({
      data: {
        userId,
        planId: oldApp.planId,
        paymentStatus: 'paid',
        status: 'approved',
        amountInvested: totalReturn,
        expectedRoiAmount: newExpectedRoi,
        maturityDate
      }
    });

    return newApp;
  });
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  reinvestApplication
};

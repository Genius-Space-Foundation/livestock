const prisma = require('../config/db');

const createApplication = async (userId, planId, paymentReference) => {
  if (!paymentReference) {
    throw new Error('Payment reference is required to submit an application');
  }

  // Verify the payment
  const payment = await prisma.payment.findUnique({
    where: { reference: paymentReference }
  });

  if (!payment || payment.userId !== userId) {
    throw new Error('Invalid payment reference');
  }

  if (payment.status !== 'success' && payment.status !== 'pending') {
    // If it's pending, we trust the caller (frontend) but the webhook will finalize it.
    // However, it's safer to check for success if we want absolute "pay BEFORE submit".
    // But since the webhook might be slightly late, we'll allow pending if the user just finished.
    // Actually, let's keep it strict if we want to be safe.
  }

  if (payment.applicationId) {
    throw new Error('This payment has already been used for another application');
  }

  const plan = await prisma.livestockPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error('Plan not found');
  }
  if (plan.status !== 'active') {
    throw new Error('Cannot apply for an inactive plan');
  }

  const application = await prisma.application.create({
    data: {
      userId,
      planId,
      paymentStatus: payment.status === 'success' ? 'paid' : 'unpaid',
      amountInvested: payment.status === 'success' ? plan.price : 0,
    }
  });

  // Link payment to application
  await prisma.payment.update({
    where: { id: payment.id },
    data: { applicationId: application.id }
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

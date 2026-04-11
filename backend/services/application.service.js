const prisma = require('../config/db');

const createApplication = async (userId, planId) => {
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
      planId
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

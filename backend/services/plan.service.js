const prisma = require('../config/db');

const getAllPlans = async () => {
  return await prisma.livestockPlan.findMany();
};

const createPlan = async (data) => {
  return await prisma.livestockPlan.create({ data });
};

const updatePlan = async (id, data) => {
  try {
    const plan = await prisma.livestockPlan.update({
      where: { id },
      data
    });
    return plan;
  } catch (error) {
    if (error.code === 'P2025') {
       throw new Error('Plan not found');
    }
    throw error;
  }
};

const deletePlan = async (id) => {
  try {
    await prisma.livestockPlan.delete({ where: { id } });
    return { id };
  } catch (error) {
    if (error.code === 'P2025') {
       throw new Error('Plan not found');
    }
    throw error;
  }
};

module.exports = {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
};

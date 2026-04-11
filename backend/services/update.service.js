const prisma = require('../config/db');

const createUpdate = async (data) => {
  return await prisma.farmUpdate.create({ data });
};

const getAllUpdates = async () => {
  return await prisma.farmUpdate.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  createUpdate,
  getAllUpdates
};

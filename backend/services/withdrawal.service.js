const prisma = require('../config/db');
const { debitWallet } = require('./wallet.service');

const requestWithdrawal = async (userId, data) => {
  const { amount, phoneNumber, network, applicationId } = data;

  // We are processing withdrawal from portfolio directly, but fallback to wallet if not tied to app.
  // Actually, if it's tied to an application, we check application maturity, not wallet balance.
  let isFromApp = false;

  if (applicationId) {
     const app = await prisma.application.findUnique({ where: { id: applicationId } });
     if (!app) throw new Error('Application not found');
     if (app.userId !== userId) throw new Error('Unauthorized');
     // Bypass wallet check for direct app withdrawals
     isFromApp = true;
     
     // Set application status to pending withdrawal
     await prisma.application.update({
       where: { id: applicationId },
       data: { withdrawalStatus: 'pending' }
     });
  } else {
     const { getWalletByUser } = require('./wallet.service');
     const wallet = await getWalletByUser(userId);
     if (wallet.balance < amount) {
       throw new Error('Insufficient wallet balance for this withdrawal request');
     }
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId,
      amount,
      phoneNumber,
      network,
      applicationId
    }
  });

  return withdrawal;
};

const getMyWithdrawals = async (userId) => {
  return await prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const getAllWithdrawals = async () => {
  return await prisma.withdrawal.findMany({
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const approveWithdrawal = async (withdrawalId) => {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'pending') {
    throw new Error(`Withdrawal is already ${withdrawal.status}`);
  }

  // If it's a generic wallet withdrawal, debit the wallet
  if (!withdrawal.applicationId) {
     await debitWallet(withdrawal.userId, withdrawal.amount);
  } else {
     // If it's an application tied withdrawal, mark application as approved payout
     await prisma.application.update({
       where: { id: withdrawal.applicationId },
       data: { withdrawalStatus: 'approved' }
     });
  }

  return await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: 'approved',
      processedAt: new Date()
    }
  });
};

const rejectWithdrawal = async (withdrawalId) => {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'pending') {
    throw new Error(`Withdrawal is already ${withdrawal.status}`);
  }

  return await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: 'rejected',
      processedAt: new Date()
    }
  });
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
};

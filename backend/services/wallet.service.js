const prisma = require('../config/db');

const getWalletByUser = async (userId) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  return wallet;
};

// Credit wallet balance using atomic transaction
const creditWallet = async (userId, amount) => {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount },
        totalDeposits: { increment: amount }
      }
    });

    return updatedWallet;
  });
};

// Debit wallet balance using atomic transaction ensuring no negative balance
const debitWallet = async (userId, amount) => {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
        totalWithdrawals: { increment: amount }
      }
    });

    return updatedWallet;
  });
};

module.exports = {
  getWalletByUser,
  creditWallet,
  debitWallet
};

const walletService = require('../services/wallet.service');

const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUser(req.user.id);
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

const getWalletByUserId = async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUser(req.params.userId);
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWallet,
  getWalletByUserId
};

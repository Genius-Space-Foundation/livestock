const withdrawalService = require('../services/withdrawal.service');

const requestWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await withdrawalService.requestWithdrawal(req.user.id, req.body);
    res.status(201).json({ success: true, data: withdrawal });
  } catch (error) {
    next(error);
  }
};

const getMyWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await withdrawalService.getMyWithdrawals(req.user.id);
    res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

const getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await withdrawalService.getAllWithdrawals();
    res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

const approveWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await withdrawalService.approveWithdrawal(req.params.id);
    res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    next(error);
  }
};

const rejectWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await withdrawalService.rejectWithdrawal(req.params.id);
    res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
};

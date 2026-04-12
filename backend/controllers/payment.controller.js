const paymentService = require('../services/payment.service');
const logger = require('../config/logger');

const initializePayment = async (req, res, next) => {
  try {
    const { amount, applicationId } = req.body;
    const callback_url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    const paymentData = await paymentService.initializePayment(req.user.id, req.user.email, amount, applicationId, callback_url);
    res.status(200).json({ success: true, data: paymentData });
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getUserPayments(req.user.id);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const paystackWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    // rawBody is attached by our express.json verify function
    await paymentService.handleWebhook(signature, req.rawBody, req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Paystack webhook error: ' + error.message);
    // Always return 200 to acknowledge receipt of webhook
    res.status(200).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getPlatformActivity = async (req, res, next) => {
  try {
    const activity = await paymentService.getPlatformActivity();
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const result = await paymentService.verifyPaymentStatus(reference);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initializePayment,
  getMyPayments,
  paystackWebhook,
  getPayments,
  getPlatformActivity,
  verifyPayment
};

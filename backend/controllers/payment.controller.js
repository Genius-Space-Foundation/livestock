const paymentService = require('../services/payment.service');
const logger = require('../config/logger');

const initializePayment = async (req, res, next) => {
  try {
    const { amount, applicationId } = req.body;
    const paymentData = await paymentService.initializePayment(req.user.id, req.user.email, amount, applicationId);
    res.status(200).json({ success: true, data: paymentData });
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

module.exports = {
  initializePayment,
  paystackWebhook,
  getPayments
};

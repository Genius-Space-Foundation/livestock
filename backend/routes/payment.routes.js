const express = require('express');
const router = express.Router();
const { initializePayment, getMyPayments, paystackWebhook, getPayments, getPlatformActivity, verifyPayment } = require('../controllers/payment.controller');
const { initializePaymentSchema } = require('../validations/payment.validation');
const { validate } = require('../middlewares/validate.middleware');
const { protect, admin } = require('../middlewares/auth.middleware');

router.post('/', protect, validate(initializePaymentSchema), initializePayment);
router.post('/webhook', paystackWebhook);
router.post('/verify/:reference', protect, verifyPayment);
router.get('/my', protect, getMyPayments);
router.get('/activity', protect, getPlatformActivity);
router.get('/', protect, admin, getPayments);

module.exports = router;

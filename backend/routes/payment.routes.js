const express = require('express');
const router = express.Router();
const { initializePayment, paystackWebhook, getPayments } = require('../controllers/payment.controller');
const { initializePaymentSchema } = require('../validations/payment.validation');
const { validate } = require('../middlewares/validate.middleware');
const { protect, admin } = require('../middlewares/auth.middleware');

router.post('/', protect, validate(initializePaymentSchema), initializePayment);
router.post('/webhook', paystackWebhook);
router.get('/', protect, admin, getPayments);

module.exports = router;

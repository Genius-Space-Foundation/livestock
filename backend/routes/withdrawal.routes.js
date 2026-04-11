const express = require('express');
const router = express.Router();
const { requestWithdrawal, getMyWithdrawals, getAllWithdrawals, approveWithdrawal, rejectWithdrawal } = require('../controllers/withdrawal.controller');
const { requestWithdrawalSchema } = require('../validations/withdrawal.validation');
const { validate } = require('../middlewares/validate.middleware');
const { protect, admin } = require('../middlewares/auth.middleware');

router.post('/', protect, validate(requestWithdrawalSchema), requestWithdrawal);
router.get('/my', protect, getMyWithdrawals);

router.get('/', protect, admin, getAllWithdrawals);
router.put('/:id/approve', protect, admin, approveWithdrawal);
router.put('/:id/reject', protect, admin, rejectWithdrawal);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getMyWallet, getWalletByUserId } = require('../controllers/wallet.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

router.get('/', protect, getMyWallet);
router.get('/:userId', protect, admin, getWalletByUserId);

module.exports = router;

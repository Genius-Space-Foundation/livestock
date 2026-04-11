const express = require('express');
const router = express.Router();
const { createUpdate, getUpdates } = require('../controllers/update.controller');
const { createUpdateSchema } = require('../validations/update.validation');
const { validate } = require('../middlewares/validate.middleware');
const { protect, admin } = require('../middlewares/auth.middleware');

router.route('/')
  .post(protect, admin, validate(createUpdateSchema), createUpdate)
  .get(getUpdates);

module.exports = router;

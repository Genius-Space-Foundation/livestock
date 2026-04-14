const express = require('express');
const router = express.Router();
const { createApplication, getApplications, updateApplicationStatus, reinvestApplication } = require('../controllers/application.controller');
const { createApplicationSchema, updateApplicationStatusSchema } = require('../validations/application.validation');
const { validate } = require('../middlewares/validate.middleware');
const { protect, admin } = require('../middlewares/auth.middleware');

router.route('/')
  .post(protect, validate(createApplicationSchema), createApplication)
  .get(protect, getApplications);

router.put('/:id/status', protect, admin, validate(updateApplicationStatusSchema), updateApplicationStatus);
router.post('/:id/reinvest', protect, reinvestApplication);

module.exports = router;

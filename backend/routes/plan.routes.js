const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/plan.controller');
const { planSchema, updatePlanSchema } = require('../validations/plan.validation');
const { validate } = require('../middlewares/validate.middleware');
const { protect, admin } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getPlans)
  .post(protect, admin, validate(planSchema), createPlan);

router.route('/:id')
  .put(protect, admin, validate(updatePlanSchema), updatePlan)
  .delete(protect, admin, deletePlan);

module.exports = router;

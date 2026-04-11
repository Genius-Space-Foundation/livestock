const planService = require('../services/plan.service');

const getPlans = async (req, res, next) => {
  try {
    const plans = await planService.getAllPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const plan = await planService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await planService.updatePlan(req.params.id, req.body);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    await planService.deletePlan(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
};

const applicationService = require('../services/application.service');

const createApplication = async (req, res, next) => {
  try {
    const { planId, paymentReference } = req.body;
    const application = await applicationService.createApplication(req.user.id, planId, paymentReference);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const applications = await applicationService.getApplications(query);
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await applicationService.updateApplicationStatus(req.params.id, status);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

const reinvestApplication = async (req, res, next) => {
  try {
    const application = await applicationService.reinvestApplication(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: application, message: 'Application reinvested successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplicationStatus,
  reinvestApplication
};

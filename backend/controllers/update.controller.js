const updateService = require('../services/update.service');

const createUpdate = async (req, res, next) => {
  try {
    const update = await updateService.createUpdate(req.body);
    res.status(201).json({ success: true, data: update });
  } catch (error) {
    next(error);
  }
};

const getUpdates = async (req, res, next) => {
  try {
    const updates = await updateService.getAllUpdates();
    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUpdate,
  getUpdates
};

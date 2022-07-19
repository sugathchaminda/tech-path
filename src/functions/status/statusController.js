const controller = require('#src/controller');
const validation = require('./statusValidation');
const service = require('./statusService');

/**
 * Controller function to process application healthcheck.
 * @param req - Http request
 * @param res - Http response
 */
const healthChecker = (req, res) => controller(req, res, {
  validator: validation.status,
  service: service.status,
});

module.exports = {
  healthChecker,
};

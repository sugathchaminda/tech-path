/**
 * Validation for request body
 */
const Joi = require('joi');

const status = () => Joi.object().keys({
  time: Joi.date().iso().required(),
});

module.exports = {
  status,
};

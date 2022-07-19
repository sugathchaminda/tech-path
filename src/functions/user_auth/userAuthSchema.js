/**
 * Validation for request body
 */
const Joi = require('joi');

const signInUser = () => Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .error(new Error('Invalid Email address'))
    .label('Email'),
  password: Joi.string().min(8).required().label('Password'),
  site_id: Joi.string().required().label('Site ID'),
});

module.exports = {
  signInUser,
};

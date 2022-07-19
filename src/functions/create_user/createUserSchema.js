/**
 * Validation for request
 */
const Joi = require('joi');
const PasswordComplexity = require('joi-password-complexity');

// common schemas
const password = {
  password: new PasswordComplexity({
    min: 8,
    max: 25,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
    required: true,
  })
    .label('Password')
    .error(new Error('PasswordNotStrongEnough')),
};

const createUser = () => Joi.object().keys({
  first_name: Joi.string().required().label('First Name'),
  surname: Joi.string().required().label('Surname'),
  job_title: Joi.string().required().label('Job Title'),
  email: Joi.string()
    .email()
    .required()
    .error(new Error('Invalid Email address'))
    .label('Email'),
  site_id: Joi.string().required().label('Site ID'),
  ...password,
});

const verifyUser = () => Joi.object().keys({
  token: Joi.string().required().label('Token'),
});

const resendVerification = () => Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .error(new Error('InvalidEmailAddress'))
    .label('Email'),
  site_id: Joi.string().required().label('Site ID'),
});

const forgotPassword = () => Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .error(new Error('InvalidEmailAddress'))
    .label('Email'),
  site_id: Joi.string().required().label('Site ID'),
});

const resetPassword = () => Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .error(new Error('InvalidEmailAddress'))
    .label('Email'),
  site_id: Joi.string().required().label('Site ID'),
  token: Joi.string().required().label('Token'),
  ...password,
});

module.exports = {
  createUser,
  verifyUser,
  resendVerification,
  forgotPassword,
  resetPassword,
};

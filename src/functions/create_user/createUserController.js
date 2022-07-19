const controller = require('#src/controller');
const {
  createUser: createUserValidator,
  verifyUser: verifyUserValidator,
  resendVerification: resendVerificationValidator,
  forgotPassword: forgotPasswordValidator,
  resetPassword: resetPasswordValidator,
} = require('./createUserValidation');
const {
  createUser: createUserService,
  verifyUser: verifyUserService,
  resendVerification: resendVerificationService,
  forgotPassword: forgotPasswordService,
  resetPassword: resetPasswordService,
} = require('./createUserService');

/**
 * Controller function to process user creation.
 * @param req - Http request
 * @param res - Http response
 */
const createUser = (req, res) => controller(req, res, {
  validator: createUserValidator,
  service: createUserService,
});

const verifyUser = (req, res) => controller(req, res, {
  validator: verifyUserValidator,
  service: verifyUserService,
});

const resendVerification = (req, res) => controller(req, res, {
  validator: resendVerificationValidator,
  service: resendVerificationService,
});

const forgotPassword = (req, res) => controller(req, res, {
  validator: forgotPasswordValidator,
  service: forgotPasswordService,
});

const resetPassword = (req, res) => controller(req, res, {
  validator: resetPasswordValidator,
  service: resetPasswordService,
});

module.exports = {
  createUser,
  verifyUser,
  resendVerification,
  forgotPassword,
  resetPassword,
};

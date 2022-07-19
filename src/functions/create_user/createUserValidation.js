const { clean, validate } = require('#utils/validationHelper');
const {
  createUser: createUserSchema,
  verifyUser: verifyUserSchema,
  resendVerification: resendVerificationSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
} = require('./createUserSchema');

const createUser = async ({ body } = {}) => {
  const attributes = clean(body);

  return validate(attributes, createUserSchema);
};

const verifyUser = async (req) => {
  const attributes = clean({
    token: req.params.token,
  });

  return validate(attributes, verifyUserSchema);
};

const resendVerification = async ({ body } = {}) => {
  const attributes = clean(body);

  return validate(attributes, resendVerificationSchema);
};

const forgotPassword = async ({ body } = {}) => {
  const attributes = clean(body);

  return validate(attributes, forgotPasswordSchema);
};

const resetPassword = async ({ body } = {}) => {
  const attributes = clean(body);

  return validate(attributes, resetPasswordSchema);
};

module.exports = {
  createUser,
  verifyUser,
  resendVerification,
  forgotPassword,
  resetPassword,
};

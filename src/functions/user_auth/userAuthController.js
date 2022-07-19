const controller = require('#src/controller');
const { signInUser: signInUserValidation } = require('./userAuthValidation');
const { signInUser: signInUserService, signOutUser: signOutUserService } = require('./userAuthService');

/**
 * Controller function to user sign in.
 * @param req - Http request
 * @param res - Http response
 */
const signInUser = (req, res) => controller(req, res, {
  validator: signInUserValidation,
  service: signInUserService,
});

/**
 * Controller function to user sign out.
 * @param req - Http request
 * @param res - Http response
 */
const signOutUser = (req, res) => controller(req, res, {
  service: signOutUserService,
});

module.exports = {
  signInUser,
  signOutUser,
};

const controller = require('#src/controller');
const {
  usersInfo: usersInfoValidator,
  editUsersInfo: editUsersInfoValidator,
} = require('./userInfoValidation');
const {
  allUsersInfo: allUsersInfoService,
  usersInfo: usersInfoService,
  editUsersInfo: editUsersInfoService,
} = require('./userInfoService');

/**
 * Controller function to get user info.
 * @param req - Http request
 * @param res - Http response
 */
const getAllUsersInfo = (req, res) => controller(req, res, {
  service: allUsersInfoService,
});

/**
 * Controller function to get user info.
 * @param req - Http request
 * @param res - Http response
 */
const getUsersInfo = (req, res) => controller(req, res, {
  validator: usersInfoValidator,
  service: usersInfoService,
});

/**
 * Controller function to edit user info.
 * @param req - Http request
 * @param res - Http response
 */
const editUsersInfo = (req, res) => controller(req, res, {
  validator: editUsersInfoValidator,
  service: editUsersInfoService,
});

module.exports = {
  getAllUsersInfo,
  getUsersInfo,
  editUsersInfo,
};

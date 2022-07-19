const { clean, validate } = require('#utils/validationHelper');
const {
  usersInfo: usersInfoSchema,
  editUsersInfo: editUsersInfoSchema,
} = require('./userInfoSchema');

const usersInfo = async ({ params } = {}) => {
  const attributes = clean(params);

  return validate(attributes, usersInfoSchema);
};

const editUsersInfo = async ({ body, params } = {}) => {
  const attributes = clean({ ...body, ...params });

  return validate(attributes, editUsersInfoSchema);
};
module.exports = {
  usersInfo,
  editUsersInfo,
};

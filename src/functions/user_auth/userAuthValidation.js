const { clean, validate } = require('#utils/validationHelper');
const schema = require('./userAuthSchema');

const signInUser = async ({ body } = {}) => {
  const attributes = clean(body);

  return validate(attributes, schema.signInUser);
};

const signOutUser = async ({ body } = {}) => {
  const attributes = clean(body);

  return validate(attributes, schema.signOutUser);
};

module.exports = {
  signInUser,
  signOutUser,
};

const { clean, validate } = require('#utils/validationHelper');
const schema = require('./statusSchema');

const status = async ({ body }) => {
  const { time } = body || {};
  const attributes = clean({ time });

  return validate(attributes, schema.status);
};

module.exports = {
  status,
};

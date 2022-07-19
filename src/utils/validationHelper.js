/**
 * Http request validator
 */
const { InterceptError } = require('#utils/errorHelper');

/**
 * Validate the request object against the given schema
 *
 * @param {*} attributes Request parameters
 * @param {*} validateFunction Schema
 * @returns Attributes set
 */
const validate = async (attributes, validateFunction) => {
  const { value, error } = validateFunction().validate(attributes, {
    allowUnknown: false,
    abortEarly: false,
  });

  if (error) {
    const errorMsg = error.message || 'Request validation error';
    throw InterceptError(errorMsg, 400);
  }

  return value;
};

/**
 * Check whether given values exists
 *
 * @param {*} value Input value
 * @returns Given values exists
 */
const isUndefined = (value) => typeof value === 'undefined';

/**
 *
 * @param {*} param
 * @param {*} condition
 * @returns Object without undefined value elements
 */
const omitBy = ({ ...obj }, condition) => {
  Object.entries(obj).forEach(
    ([key, value]) => condition(value) && delete obj[key],
  );
  return obj;
};

/**
 * Do clean the request parameters
 *
 * @param {*} object Input object
 * @returns Cleaned object
 */
const clean = (object) => omitBy(object, isUndefined);

module.exports = {
  validate,
  clean,
};

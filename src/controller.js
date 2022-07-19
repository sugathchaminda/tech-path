/**
 * Base controller
 */
const { defaultReject, defaultResolve } = require('#utils/responseHelper');

/**
 *
 * @param {*} req Http request
 * @param {*} res Http response
 * @param {*} params Additional parameters
 * @returns
 */
const controller = async (req, res, params) => {
  const resolve = params.resolve || defaultResolve;
  const reject = params.reject || defaultReject;

  try {
    // attributes
    const attributes = params.validator ? await params.validator(req) : {};

    if (req.cookies) {
      attributes.cookies = req.cookies;
    }
    if (req.headers) {
      attributes.headers = req.headers;
    }
    const data = await params.service(attributes, {});

    return resolve(res, data);
  } catch (err) {
    return reject(err, res, req);
  }
};

module.exports = controller;

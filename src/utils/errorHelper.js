const Boom = require('@hapi/boom');

/**
 * Return custom error in Boom template
 * @param error
 * @param error.statusCode - HTTP error code
 * @param [error.message] - Error message
 */
const boom = (error) => {
  switch (error.statusCode) {
    case 400:
      return Boom.badRequest(error.message).output;
    case 401:
      return Boom.unauthorized(error.message).output;
    case 403:
      return Boom.forbidden(error.message).output;
    case 404:
      return Boom.notFound(error.message).output;
    case 405:
      return Boom.methodNotAllowed(error.message).output;
    case 406:
      return Boom.notAcceptable(error.message).output;
    case 408:
      return Boom.clientTimeout(error.message).output;
    case 414:
      return Boom.uriTooLong(error.message).output;
    case 415:
      return Boom.unsupportedMediaType(error.message).output;
    case 422:
      return Boom.badData(error.message).output;
    default:
      return Boom.badImplementation('Un known error').output;
  }
};

/**
 * Return CustomError (Intercept Error).
 * @param message
 * @param code
 * @returns Error object
 */
const InterceptError = (message, code = 500) => {
  const error = new Error(message);
  error.code = code;

  return error;
};

module.exports = {
  boom,
  InterceptError,
};

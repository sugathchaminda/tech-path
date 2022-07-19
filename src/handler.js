const api = require('lambda-api')({ version: 'v1.0', base: '/v1' });
// const awsXRay = require('aws-xray-sdk');
// awsXRay.captureAWS(require('aws-sdk'));
const { doAuth } = require('#utils/authHelper');
const routes = require('./routes');
const cors = require('./middlewares/cors');

api.use(cors);
routes.load(api);

module.exports.run = async (event, context) => {
  try {
    return api.run(event, context);
  } catch (err) {
    throw new Error('Unknown error occurred, handler.js');
  }
};

module.exports.tpAuthorizer = async (event) => doAuth(event);

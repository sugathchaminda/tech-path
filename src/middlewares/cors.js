/**
 * Middleware to manage cors in application
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next next operation
 */
module.exports = (req, res, next) => {
  // Add default CORS headers for every request
  res.cors({
    methods: 'GET, PATCH, POST, PUT, DELETE, OPTIONS',
    headers: 'Content-Type, Authorization, Content-Length, X-Requested-With',
  });

  const { origin } = req.headers;

  if (
    process.env.ALLOWED_ORIGINS
      && process.env.ALLOWED_ORIGINS.indexOf(origin) > -1
  ) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.LAMBDA_STAGE === 'local') {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Authorization');

  next();
};

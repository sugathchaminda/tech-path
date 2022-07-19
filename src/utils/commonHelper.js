/**
 * Genaric functions which use through entire project
 */
const { ulid } = require('ulid');
const jwt = require('jsonwebtoken');

/**
 * Generate unique ID based on timestamp
 *
 * @returns unique ID
 */
const getUniqueKey = () => ulid();

const extractDomainFromEmail = (email) => email.split('@').pop();

/**
 * To generate JWT token
 * @param {*} data Object
 * @param {*} secret String
 * @returns encrypted JWT token
 */
const generateJwtToken = (data, secret, expiresIn = '2d') => jwt.sign(data, secret, { expiresIn });

const verifyJwtToken = (token, secret) => jwt.verify(token, secret);

const getCurrentTimestamp = () => new Date().toISOString();

module.exports = {
  getUniqueKey,
  extractDomainFromEmail,
  generateJwtToken,
  verifyJwtToken,
  getCurrentTimestamp,
};

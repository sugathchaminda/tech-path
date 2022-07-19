/**
 * Application level constants
 */
module.exports = Object.freeze({
  // dynamodb tables
  DYNAMO_TABLE_STATUS: `techpath-status-${process.env.LAMBDA_STAGE}`,
  DYNAMO_TABLE_SME: `techpath-sme-${process.env.LAMBDA_STAGE}`,
  DYNAMO_TABLE_ORGANISATION: `techpath-organisation-${process.env.LAMBDA_STAGE}`,
  DYNAMO_TABLE_USER: `techpath-user-${process.env.LAMBDA_STAGE}`,
  DYNAMO_TABLE_TAG: `techpath-tag-${process.env.LAMBDA_STAGE}`,
  DYNAMO_TABLE_USER_TAG: `techpath-user-tag-${process.env.LAMBDA_STAGE}`,

  // restricted/allowed email domains for SME registration
  EMAIL_DOMAINS_RESTRICTED: ['gmail.com', 'yahoo.com', 'hotmail.com', 'apple.com'],
  EMAIL_DOMAINS_ALLOWED: ['newpath.com'],
  SENDER_EMAIL: 'd.darshana@newpath.com',

  // SME email verification link expire duration
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: '30 days',

  FRONT_END_DOMAIN: process.env.FRONT_END_DOMAIN,

  // cognito user pool id
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  // cognito client id
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,

  // get started complated by SME
  SME_SETUP_STATUS: {
    PENDING: 0,
    COMPLETED: 1,
  },

  // default tag which need to create for every SME
  DEFAULT_TAG_NAME: 'Everyone',

  // roles in the appliction
  ROLES: {
    ADMIN: 'admin',
    MEMBER: 'member',
  },
  // email templates
  WELCOME_EMAIL: 'techpath-welcome-template',
  RESET_PASSWORD_EMAIL: 'techpath-reset-password-template',
});

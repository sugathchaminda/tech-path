const aws = require('aws-sdk');
const {
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
} = require('#utils/constants');

// Set the AWS Region.
aws.config.update({ region: process.env.LAMBDA_REGION });

// Create an Amazon Cognito service client object.
const cognitoClient = new aws.CognitoIdentityServiceProvider();

const updateCognitoUserPassword = async (email, password, userPoolId) => {
  const params = {
    Password: password,
    UserPoolId: userPoolId,
    Username: email,
    Permanent: true,
  };
  await cognitoClient.adminSetUserPassword(params).promise();
};

const deleteCognitoUser = async (email, userPoolId) => {
  const params = {
    UserPoolId: userPoolId,
    Username: email,
  };

  return cognitoClient.adminDeleteUser(params).promise();
};

const signUpCognitoUser = async (email, password, siteId, userPoolId) => {
  const params = {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [{
      Name: 'email',
      Value: email,
    },
    {
      Name: 'custom:site_id',
      Value: siteId,
    },
    {
      Name: 'email_verified',
      Value: 'true',
    }],
    MessageAction: 'SUPPRESS',
  };
  const response = await cognitoClient.adminCreateUser(params).promise();

  if (response.User) {
    await updateCognitoUserPassword(email, password, userPoolId);
  }
};

const adminIntiateAuth = async (email, password) => {
  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: COGNITO_USER_POOL_ID,
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  return cognitoClient.adminInitiateAuth(params).promise();
};

const globalSignOut = async (accessToken) => {
  const params = {
    AccessToken: accessToken,
  };
  return cognitoClient.globalSignOut(params).promise();
};

const getCognitoUserFromToken = async (token) => {
  const params = {
    AccessToken: token,
  };

  return cognitoClient.getUser(params).promise();
};

const buildAuthorizerResponse = (principleId, effect) => (
  {
    principalId: principleId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*',
        },
      ],
    },
  }
);

const changePassword = async (token, previousPassword, proposedPassword) => {
  const params = {
    AccessToken: token,
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword,
  };

  return cognitoClient.changePassword(params).promise();
};

module.exports = {
  cognitoClient,
  signUpCognitoUser,
  updateCognitoUserPassword,
  deleteCognitoUser,
  adminIntiateAuth,
  globalSignOut,
  getCognitoUserFromToken,
  buildAuthorizerResponse,
  changePassword,
};

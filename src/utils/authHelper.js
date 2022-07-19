/**
 * Authentication related utils
 *
 */
const { getCognitoUserFromToken, buildAuthorizerResponse } = require('#utils/cognitoHelper');

const doAuth = async (event) => {
  const { headers: { authorization: accessToken } } = event;
  const effect = 'Allow';
  let cognitoUserId = null;

  try {
    // validate given token with Cognito
    // Eg response = {
    //   Username: '1aebdcf6-cc43-40b7-b05e-1cd7b04b8ef4',
    //   UserAttributes: [
    //     { Name: 'sub', Value: '1aebdcf6-cc43-40b7-b05e-1cd7b04b8ef4' },
    //     { Name: 'email_verified', Value: 'true' },
    //     { Name: 'custom:site_id', Value: 'xxxxxxxxx' },
    //     { Name: 'email', Value: 'bob@newpath.com' }
    //   ]
    // }
    const { Username: userName } = await getCognitoUserFromToken(accessToken);
    cognitoUserId = userName;

    // TODO...
    // from response we can get site_id and email, then can query from user table to check
    // which role this user has
    // then can implement role based access control from there. Just an idea...
    // OR we can assign role to Cognito as custom field then use it....

    return buildAuthorizerResponse(cognitoUserId, effect);
  } catch (error) {
    console.log(`lambda authorizer error - ${cognitoUserId}`, error);

    return buildAuthorizerResponse('user', 'deny');
  }
};

module.exports = {
  doAuth,
};

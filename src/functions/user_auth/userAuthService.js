/**
 * Sign in SME user
 *
 */
const { adminIntiateAuth, globalSignOut } = require('#utils/cognitoHelper');
const { InterceptError } = require('#utils/errorHelper');
const { docClientQuery } = require('#utils/dynamoDbHelper');
const {
  DYNAMO_TABLE_USER, DYNAMO_TABLE_SME,
} = require('#utils/constants');

/**
 *
 * @param {*} data request object
 * @returns response as JSON
 */
const signInUser = async (data) => {
  const {
    email,
    password,
    site_id: siteId,
  } = data;

  const paramsOrg = {
    TableName: DYNAMO_TABLE_USER,
    IndexName: 'GSI3-site-id-email-index',
    KeyConditionExpression: 'site_id = :s and email = :e',
    ExpressionAttributeValues: {
      ':s': siteId,
      ':e': email,
    },
  };

  try {
    const { Items, Count } = await docClientQuery(paramsOrg);

    if (Count === 0) {
      throw InterceptError('UserNotExists', 400);
    }
    if (!Items[0].attributes.email_verified) {
      throw InterceptError('EmailNotVerified', 400);
    }

    const [{
      attributes: {
        first_name: firstName, surname,
      }, id, email: userEmail, role,
    }] = Items;
    const response = await adminIntiateAuth(email, password);

    const paramsSME = {
      TableName: DYNAMO_TABLE_SME,
      IndexName: 'GSI1-site-id-index',
      KeyConditionExpression: 'site_id = :s',
      ExpressionAttributeValues: {
        ':s': siteId,
      },
    };

    const { Items: smeItems } = await docClientQuery(paramsSME);

    const [{ setup_done: setUpDone }] = smeItems;

    return {
      message: 'UserSignedSuccessfully',
      data: {
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
        idToken: response.AuthenticationResult.IdToken,
        user: {
          id,
          role,
          name: `${firstName} ${surname}`,
          firstName,
          surname,
          email: userEmail,
          smeSetupCompleted: !!setUpDone,
        },
      },
    };
  } catch (error) {
    console.log('Error on sign in', error);
    if (error.code === 'NotAuthorizedException') {
      throw InterceptError('InvalidEmailPassword', 400);
    }
    throw error;
  }
};

/**
  *
  * @param {*} data request object
  * @returns response as JSON
  */
const signOutUser = async (req) => {
  const {
    headers: { authorization: accessToken },
  } = req;

  try {
    await globalSignOut(accessToken);

    return {
      message: 'UserSignedOutSuccessfully',
    };
  } catch (error) {
    console.log('Error on sign out', error);
    if (error.code === 'NotAuthorizedException') {
      throw InterceptError('InvalidAccessToken', 400);
    }
    throw error;
  }
};

module.exports = {
  signInUser,
  signOutUser,
};

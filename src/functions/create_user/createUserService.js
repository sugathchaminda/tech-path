/**
 * Create SME user
 *
 */
const {
  getUniqueKey,
  extractDomainFromEmail,
  generateJwtToken,
  verifyJwtToken,
  getCurrentTimestamp,
} = require('#utils/commonHelper');
const {
  DYNAMO_TABLE_SME,
  DYNAMO_TABLE_USER,
  EMAIL_DOMAINS_RESTRICTED,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  FRONT_END_DOMAIN,
  COGNITO_USER_POOL_ID,
  DYNAMO_TABLE_TAG,
  SME_SETUP_STATUS: { PENDING },
  DEFAULT_TAG_NAME,
  ROLES: { ADMIN, MEMBER },
  DYNAMO_TABLE_USER_TAG,
  WELCOME_EMAIL,
  RESET_PASSWORD_EMAIL,
} = require('#utils/constants');
const {
  docClientQuery,
  docClientPut,
  docClientUpdate,
  docClientDelete,
} = require('#utils/dynamoDbHelper');
const { InterceptError } = require('#utils/errorHelper');
const { sendTemplateEmail } = require('#utils/emailHelper');
const { signUpCognitoUser, deleteCognitoUser, updateCognitoUserPassword } = require('#utils/cognitoHelper');
/**
 *
 * @param {*} data request object
 * @returns response as JSON
 */
const createUser = async (data) => {
  const {
    first_name: firstName,
    surname,
    job_title: jobTitle,
    email,
    password,
    site_id: siteId,
  } = data;

  // no all emails are allowed
  const emailDomain = extractDomainFromEmail(email);

  if (EMAIL_DOMAINS_RESTRICTED.includes(emailDomain)) {
    throw InterceptError('OnlyOrgEmailsAreAllowed', 400);
  }

  // check this is a very first user who register in SME
  const paramsOrg = {
    TableName: DYNAMO_TABLE_SME,
    IndexName: 'GSI1-site-id-index',
    KeyConditionExpression: 'site_id = :s and email_domain = :e',
    ExpressionAttributeValues: {
      ':s': siteId,
      ':e': emailDomain,
    },
  };

  try {
    const { Items, Count } = await docClientQuery(paramsOrg);

    // if no SME register yet, register SME first
    let createdSmeId = null;
    let role = MEMBER;

    if (Count === 0) {
      createdSmeId = getUniqueKey();
      role = ADMIN;

      const paramsNewSME = {
        Item: {
          id: createdSmeId,
          site_id: siteId,
          email_domain: emailDomain,
          setup_done: PENDING,
          attributes: {
            organisation_name: '',
          },
          created_at: getCurrentTimestamp(),
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: DYNAMO_TABLE_SME,
      };

      // create Everyone tag for this SME
      const paramsDefaultTag = {
        Item: {
          id: getUniqueKey(),
          sme_id: createdSmeId,
          name: DEFAULT_TAG_NAME,
          value: 0,
          is_default: 1,
          created_at: getCurrentTimestamp(),
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: DYNAMO_TABLE_TAG,
      };

      await Promise.all([
        docClientPut(paramsNewSME),
        docClientPut(paramsDefaultTag),
      ]);
    }

    // if there is SME already registered
    const smeId = Items[0] ? Items[0].id : createdSmeId;

    // check whether user already registered with same SME user
    const paramsUser = {
      TableName: DYNAMO_TABLE_USER,
      IndexName: 'GSI1-sme-id-email-index',
      KeyConditionExpression: 'sme_id = :s and email = :e',
      ExpressionAttributeValues: {
        ':s': smeId,
        ':e': email,
      },
    };

    const { Items: itemsUser, Count: CountUsers } = await docClientQuery(paramsUser);

    if (CountUsers > 0) {
      const [{ id, attributes: { email_verified: emailVerified } }] = itemsUser;

      if (emailVerified) {
        throw InterceptError('UserAlreadyExists', 400);
      }
      // if user already exists, but not verified his account
      await deleteCognitoUser(email, COGNITO_USER_POOL_ID);

      const params = {
        TableName: DYNAMO_TABLE_USER,
        Key: {
          id,
          sme_id: smeId,
        },
      };

      await docClientDelete(params);
    }

    // register as new member of SME
    const verificationToken = generateJwtToken({
      email,
      site_id: siteId,
      sme_id: smeId,
    }, process.env.JSON_WEB_TOKEN_SECRET, EMAIL_VERIFY_TOKEN_EXPIRES_IN);

    const paramsNewUser = {
      Item: {
        id: getUniqueKey(),
        sme_id: smeId,
        site_id: siteId,
        email,
        verification_code: verificationToken,
        approver: 'null',
        role,
        attributes: {
          first_name: firstName,
          surname,
          job_title: jobTitle,
          email_verified: false,
          deparment: '',
          report_to: '',
        },
        created_at: getCurrentTimestamp(),
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: DYNAMO_TABLE_USER,
    };

    await docClientPut(paramsNewUser);

    // create a tag for job title if it's not exists
    // TODO...

    // create entry in Cognito user pool
    // TODO... Cognito user pool id shoud be picked up dynamically.
    // Giveing fixed pool id for MVP
    await signUpCognitoUser(email, password, siteId, COGNITO_USER_POOL_ID);

    // send verification email to user
    const verifyLink = `${FRONT_END_DOMAIN}/verify-email-token/${email}/${verificationToken}`;
    const emailTemplateData = `{ "email": "${email}", "expireTime": "${EMAIL_VERIFY_TOKEN_EXPIRES_IN}", "verifyLink": "${verifyLink}" }`;

    await sendTemplateEmail([email], WELCOME_EMAIL, emailTemplateData);

    // everything went well
    return {
      message: 'UserCreatedSuccessfully',
      statusCode: 200,
      data: {
        first_name: firstName,
        surname,
        job_title: jobTitle,
        email,
        site_id: siteId,
      },
    };
  } catch (error) {
    console.log('Error on crete user SME lookup', error);
    throw error;
  }
};

/**
 * Verify SME user email address
 * @param {*} param0 token
 * @returns object
 */
const verifyUser = async ({ token }) => {
  try {
    // check given user token valid in DB
    const paramsUser = {
      TableName: DYNAMO_TABLE_USER,
      IndexName: 'GSI2-verification-code-index',
      KeyConditionExpression: 'verification_code = :s',
      ExpressionAttributeValues: {
        ':s': token,
      },
    };

    const { Items, Count: CountUsers } = await docClientQuery(paramsUser);

    // user found, which means token is valid for application
    if (CountUsers > 0) {
      const { email: emailFromToken } = verifyJwtToken(token, process.env.JSON_WEB_TOKEN_SECRET);
      const [{
        email, id, sme_id: smeId, attributes: { email_verified: emailVerified },
      }] = Items;

      if (emailFromToken !== email) {
        throw InterceptError('TokenInvalid', 400);
      }

      if (emailVerified) {
        throw InterceptError('EmailAlreadyVerified', 400);
      }

      // mark user as verified
      const params = {
        TableName: DYNAMO_TABLE_USER,
        Key: {
          id,
          sme_id: smeId,
        },
        UpdateExpression: 'SET attributes.#key = :value',
        ExpressionAttributeNames: { '#key': 'email_verified' },
        ExpressionAttributeValues: {
          ':value': true,
        },
        ReturnValues: 'UPDATED_NEW',
      };

      const promiseArr = [];

      promiseArr.push(docClientUpdate(params));

      // attache default tag to user
      const paramsTags = {
        TableName: DYNAMO_TABLE_TAG,
        IndexName: 'GSI2-sme-id-is-default-index',
        KeyConditionExpression: 'is_default = :id and sme_id = :si',
        ExpressionAttributeValues: {
          ':id': 1,
          ':si': smeId,
        },
      };

      const { Items: tagsDefault, Count: defaultTagsCount } = await docClientQuery(paramsTags);

      if (defaultTagsCount > 0) {
        const [{ id: defaultTagId }] = tagsDefault;
        const paramsTagUser = {
          Item: {
            tag_id: defaultTagId,
            user_id: id,
            created_at: getCurrentTimestamp(),
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: DYNAMO_TABLE_USER_TAG,
        };
        promiseArr.push(docClientPut(paramsTagUser));
      }

      await Promise.all(promiseArr);

      return {
        data: {
          token,
        },
        message: 'EmailVerifiedSuccessfully',
      };
    }

    throw InterceptError('UserNotFound', 400);
  } catch (error) {
    console.log('Error on verify SME user email', error);
    if (error.name === 'TokenExpiredError') {
      throw InterceptError('TokenExpired', 400);
    } else if (error.name === 'JsonWebTokenError') {
      throw InterceptError('TokenInvalid', 400);
    }
    throw error;
  }
};

/**
 * Re send account verification code
 * @param {*} data email and site_id
 * @returns API response
 */
const resendVerification = async (data) => {
  const { email, site_id: siteId } = data;

  // validate the request against DB
  const paramsUser = {
    TableName: DYNAMO_TABLE_USER,
    IndexName: 'GSI3-site-id-email-index',
    KeyConditionExpression: 'site_id = :s and email = :e',
    ExpressionAttributeValues: {
      ':s': siteId,
      ':e': email,
    },
  };

  try {
    const { Items, Count: CountUsers } = await docClientQuery(paramsUser);

    if (CountUsers === 0) {
      throw InterceptError('InvalidUser', 400);
    }

    // user exists for given site_id and email
    const [{ id, sme_id: smeId, attributes: { email_verified: emailVerified } }] = Items;

    // when email already verified
    if (emailVerified) {
      throw InterceptError('EmailAlreadyVerified', 400);
    }

    // generate new token
    const verificationToken = generateJwtToken({
      email,
      site_id: siteId,
      sme_id: smeId,
    }, process.env.JSON_WEB_TOKEN_SECRET, EMAIL_VERIFY_TOKEN_EXPIRES_IN);

    // update user table with new verify token
    const params = {
      TableName: DYNAMO_TABLE_USER,
      Key: {
        id,
        sme_id: smeId,
      },
      UpdateExpression: 'SET verification_code = :code',
      ExpressionAttributeValues: {
        ':code': verificationToken,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await docClientUpdate(params);

    // resend verification code
    const verifyLink = `${FRONT_END_DOMAIN}/verify-email-token/${email}/${verificationToken}`;
    const emailTemplateData = `{ "email": "${email}", "expireTime": "${EMAIL_VERIFY_TOKEN_EXPIRES_IN}", "verifyLink": "${verifyLink}" }`;

    await sendTemplateEmail([email], WELCOME_EMAIL, emailTemplateData);

    return {
      data: {
        email,
        site_id: siteId,
      },
      message: 'EmailVerificationSent',
    };
  } catch (error) {
    console.log('Error on resend verification code', error);
    throw error;
  }
};

/**
 * Send forget password request
 * @param {*} data Object
 */
const forgotPassword = async (data) => {
  const { email, site_id: siteId } = data;

  // validate the request against DB
  const paramsUser = {
    TableName: DYNAMO_TABLE_USER,
    IndexName: 'GSI3-site-id-email-index',
    KeyConditionExpression: 'site_id = :s and email = :e',
    ExpressionAttributeValues: {
      ':s': siteId,
      ':e': email,
    },
  };

  try {
    const { Items, Count: CountUsers } = await docClientQuery(paramsUser);

    if (CountUsers === 0) {
      throw InterceptError('InvalidUser', 400);
    }

    // user exists for given site_id and email
    const [{ id, sme_id: smeId, attributes: { email_verified: emailVerified } }] = Items;

    // when email not verified
    if (!emailVerified) {
      throw InterceptError('EmailNotVerified', 400);
    }

    // generate new token
    const verificationToken = generateJwtToken({
      context: 'reset-pw',
      email,
      site_id: siteId,
      sme_id: smeId,
    }, process.env.JSON_WEB_TOKEN_SECRET, EMAIL_VERIFY_TOKEN_EXPIRES_IN);

    // update user table with new verify token
    const params = {
      TableName: DYNAMO_TABLE_USER,
      Key: {
        id,
        sme_id: smeId,
      },
      UpdateExpression: 'SET verification_code = :code',
      ExpressionAttributeValues: {
        ':code': verificationToken,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await docClientUpdate(params);

    // send reset password email
    const resetPasswordLink = `${FRONT_END_DOMAIN}/reset-password/${email}/${verificationToken}`;
    const emailTemplateData = `{"resetPasswordLink": "${resetPasswordLink}" }`;

    await sendTemplateEmail([email], RESET_PASSWORD_EMAIL, emailTemplateData);

    return {
      data: {
        email,
        site_id: siteId,
      },
      message: 'PasswordResetEmailSent',
    };
  } catch (error) {
    console.log('Error on forgot password', error);
    throw error;
  }
};

/**
 * Reset SME user password
 * @param {*} data Object
 * @returns Http response
 */
const resetPassword = async (data) => {
  const {
    email, site_id: siteId, token, password,
  } = data;

  try {
    const paramsUser = {
      TableName: DYNAMO_TABLE_USER,
      IndexName: 'GSI2-verification-code-index',
      KeyConditionExpression: 'verification_code = :s',
      ExpressionAttributeValues: {
        ':s': token,
      },
    };

    const { Items, Count: CountUsers } = await docClientQuery(paramsUser);

    // token not found
    if (CountUsers === 0) {
      throw InterceptError('InvalidToken', 400);
    }

    const { context, email: emailInToken } = verifyJwtToken(token, process.env.JSON_WEB_TOKEN_SECRET);

    const [{ id, sme_id: smeId, email: emailInDB }] = Items;

    // check context of the token
    if (context !== 'reset-pw' || emailInDB !== emailInToken) {
      throw InterceptError('InvalidUseOfToken', 400);
    }

    // update cognito user password
    updateCognitoUserPassword(email, password, COGNITO_USER_POOL_ID);

    // update user table with new verify token
    const params = {
      TableName: DYNAMO_TABLE_USER,
      Key: {
        id,
        sme_id: smeId,
      },
      UpdateExpression: 'SET verification_code = :code',
      ExpressionAttributeValues: {
        ':code': 'null',
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await docClientUpdate(params);

    return {
      data: {
        email,
        site_id: siteId,
      },
      message: 'PasswordResetSuccessfully',
    };
  } catch (error) {
    console.log('Error on reset password', error);
    throw error;
  }
};

module.exports = {
  createUser,
  verifyUser,
  resendVerification,
  forgotPassword,
  resetPassword,
};

/* eslint-disable no-multi-str */
/**
 * Get User information
 *
 */
const {
  DYNAMO_TABLE_USER, DYNAMO_TABLE_USER_TAG, DYNAMO_TABLE_TAG, DYNAMO_TABLE_SME,
} = require('#utils/constants');
const {
  getCurrentTimestamp,
} = require('#utils/commonHelper');
const {
  docClientUpdate,
  docClientQuery,
  docClientGetBatchItems,
  docClientDelete,
  docClientPut,
} = require('#utils/dynamoDbHelper');
const {
  changePassword,
} = require('#utils/cognitoHelper');
const { InterceptError } = require('#utils/errorHelper');

/**
 * Get all Users info from id
 * @param {*} param0 userId
 * @returns object
 */
const allUsersInfo = async () => {
  const { site_id: siteId, sme_id: smeId } = {
    site_id: '01G562W6T8HCE2ZDCANTPTFV1Q',
    user_id: '01G7P0V6AD8TM78ADPS18BPZD0',
    sme_id: '01G741FCJNVJMNX5HP5YNDHYT7',
  }; // TODO remove object body

  try {
    const paramsUser = {
      TableName: DYNAMO_TABLE_USER,
      IndexName: 'GSI6-site-id-sme-id-index',
      KeyConditionExpression: 'site_id = :s and sme_id = :e',
      ExpressionAttributeValues: {
        ':s': siteId,
        ':e': smeId,
      },
    };

    const { Items: itemsUsers, Count: CountUsers } = await docClientQuery(paramsUser);

    if (CountUsers === 0) {
      throw InterceptError('UserNotFound', 400);
    }

    const users = await Promise.all(itemsUsers.map(async (itemUser) => {
      const {
        id, role, approver, email, attributes: {
          first_name: firstName, surname, job_title: jobTitle, profile_pic: profilePicture, department, reportsTo,
        },
      } = itemUser;

      let allUserTags = [];
      const paramsUserTags = {
        TableName: DYNAMO_TABLE_USER_TAG,
        IndexName: 'GSI1-user-id-index',
        KeyConditionExpression: 'user_id = :s',
        ExpressionAttributeValues: {
          ':s': id,
        },
      };

      const { Items: itemsUserTags, Count: CountUserTags } = await docClientQuery(paramsUserTags);

      if (CountUserTags > 0) {
        const userTags = itemsUserTags.map((userTag) => {
          const tagSmeData = { id: userTag.tag_id, sme_id: smeId };
          return tagSmeData;
        });

        const paramsTags = {
          RequestItems: {
            [DYNAMO_TABLE_TAG]: {
              Keys: userTags,
            },
          },
        };

        const { Responses } = await docClientGetBatchItems(paramsTags);
        allUserTags = Responses['techpath-tag-dev'].map((itemTag) => {
          const tagSmeData = itemTag.name;
          return tagSmeData;
        });
      }

      const userInfo = {
        userId: id,
        firstName,
        lastName: surname,
        email,
        jobTitle,
        department,
        tags: allUserTags,
        profilePicture,
        role,
        reportsTo,
        approvingCount: 2,
        approver: !approver || approver === 'null' ? null : approver,
        approvedProducts: 2,
        budgetUsed: 3000,
      };

      return userInfo;
    }));

    return {
      message: 'UserFetchedSuccessfully',
      statusCode: 200,
      data: { users },
    };
  } catch (error) {
    console.log('Error on gettign all users information', error);
    throw error;
  }
};

/**
 * Get User info from id
 * @param {*} param0 userId
 * @returns object
 */
const usersInfo = async ({ userId }) => {
  const { sme_id: smeId } = {
    site_id: '01G562W6T8HCE2ZDCANTPTFV1Q',
    user_id: '01G7P0V6AD8TM78ADPS18BPZD0',
    sme_id: '01G741FCJNVJMNX5HP5YNDHYT7',
  }; // TODO remove object body

  try {
    const paramsUser = {
      TableName: DYNAMO_TABLE_USER,
      KeyConditionExpression: 'id = :id and sme_id = :sId',
      ExpressionAttributeValues: {
        ':id': userId,
        ':sId': smeId,
      },
    };

    const { Items: itemsUsers, Count: CountUsers } = await docClientQuery(paramsUser);

    if (CountUsers === 0) {
      throw InterceptError('UserNotFound', 400);
    }

    const [{
      id, email, site_id: siteId, role, approver, attributes: {
        first_name: firstName, surname, job_title: jobTitle, profile_pic: profilePicture, department, report_to: reportsTo, product_send_to: productSendTo,
      },
      address: {
        deliver_name: deliverName,
        line_1: deliveryAddressLine1,
        line_2: deliveryAddressLine2,
        city: deliveryCity,
        country: deliveryCountry,
        postcode: deliveryPostcode,
      },
    }] = itemsUsers;

    const paramsOrg = {
      TableName: DYNAMO_TABLE_SME,
      IndexName: 'GSI1-site-id-index',
      KeyConditionExpression: 'site_id = :s',
      ExpressionAttributeValues: {
        ':s': siteId,
      },
    };

    const { Items } = await docClientQuery(paramsOrg);

    const [{
      address: {
        deliver_name: SMEDeliveryName,
        line_1: SMEDeliveryAddressLine1,
        line_2: SMEDeliveryAddressLine2,
        city: SMEDeliveryCity,
        country: SMEDeliveryCountry,
        postcode: SMEDeliveryPostcode,
      },
      attributes: { sme_name: smeName },
      setup_done: setUpDone,
    }] = Items;

    let allUserTags = [];
    const paramsUserTags = {
      TableName: DYNAMO_TABLE_USER_TAG,
      IndexName: 'GSI1-user-id-index',
      KeyConditionExpression: 'user_id = :s',
      ExpressionAttributeValues: {
        ':s': id,
      },
    };

    const { Items: itemsUserTags, Count: CountUserTags } = await docClientQuery(paramsUserTags);

    if (CountUserTags > 0) {
      const userTags = itemsUserTags.map((userTag) => {
        const tagSmeData = { id: userTag.tag_id, sme_id: smeId };
        return tagSmeData;
      });
      const paramsTags = {
        RequestItems: {
          [DYNAMO_TABLE_TAG]: {
            Keys: userTags,
          },
        },
      };

      const { Responses } = await docClientGetBatchItems(paramsTags);

      allUserTags = Responses['techpath-tag-dev'].map((itemTag) => {
        const tagSmeData = itemTag.name;
        return tagSmeData;
      });
    }

    return {
      message: 'UserFetchedSuccessfully',
      statusCode: 200,
      data: {
        user: {
          userId: id,
          firstName,
          lastName: surname,
          email,
          jobTitle,
          department,
          tags: allUserTags,
          profilePicture,
          role,
          reportsTo,
          approvingCount: 2,
          approver: !approver || approver === 'null' ? null : approver,
          approvedProducts: 2,
          budgetUsed: 3000,
          productSendTo,
          smeName,
          smeSetupCompleted: !!setUpDone,
          address: {
            sme: {
              deliverName: SMEDeliveryName, line1: SMEDeliveryAddressLine1, line2: SMEDeliveryAddressLine2, city: SMEDeliveryCity, country: SMEDeliveryCountry, postcode: SMEDeliveryPostcode,
            },
            user: {
              deliverName, line1: deliveryAddressLine1, line2: deliveryAddressLine2, city: deliveryCity, country: deliveryCountry, postcode: deliveryPostcode,
            },
          },
        },
      },
    };
  } catch (error) {
    console.log('Error on gettign user information', error);
    throw error;
  }
};

/**
 * Edit User info from id
 * @param {*} param0 userId
 * @returns object
 */
const editUsersInfo = async (data) => {
  const { sme_id: smeId } = {
    site_id: '01G562W6T8HCE2ZDCANTPTFV1Q',
    user_id: '01G7P0V6AD8TM78ADPS18BPZD0',
    sme_id: '01G741FCJNVJMNX5HP5YNDHYT7',
  }; // TODO remove object body

  try {
    const {
      userId,
      firstName,
      lastName,
      jobTitle,
      department,
      tags,
      reportsTo,
      approver,
      productSendTo,
      address: {
        deliverName,
        line1,
        line2,
        city,
        country,
        postcode,
      },
      previousPassword,
      password,
      headers: { authorization: accessToken },
    } = data;
    const params = {
      TableName: DYNAMO_TABLE_USER,
      Key: {
        id: userId,
        sme_id: smeId,
      },
      UpdateExpression: 'SET attributes.first_name = :firstName, attributes.surname = :surname, attributes.job_title = :jobTitle, attributes.department = :department, \
      attributes.report_to = :reportTo, attributes.product_send_to = :productSendTo, \
    approver = :approver, address.deliver_name = :deliverName, address.line_1 = :line1, address.line_2 = :line2, \
    address.city = :city, address.country = :country, address.postcode = :postcode',
      ExpressionAttributeValues: {
        ':firstName': firstName,
        ':surname': lastName,
        ':jobTitle': jobTitle,
        ':department': department,
        ':reportTo': reportsTo || 'null',
        ':approver': approver || 'null',
        ':productSendTo': productSendTo,
        ':deliverName': deliverName,
        ':line1': line1,
        ':line2': line2,
        ':city': city,
        ':country': country,
        ':postcode': postcode,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await docClientUpdate(params);

    // get all user tags and delete
    const paramsUserTags = {
      TableName: DYNAMO_TABLE_USER_TAG,
      IndexName: 'GSI1-user-id-index',
      KeyConditionExpression: 'user_id = :s',
      ExpressionAttributeValues: {
        ':s': userId,
      },
    };

    const { Items: itemsUserTags, Count: CountUserTags } = await docClientQuery(paramsUserTags);

    if (CountUserTags > 0) {
      await Promise.all(itemsUserTags.map(async (userTag) => {
        const { tag_id: tagId } = userTag;

        const paramsOldUserTags = {
          TableName: DYNAMO_TABLE_USER_TAG,
          Key: {
            user_id: userId,
            tag_id: tagId,
          },
        };
        await docClientDelete(paramsOldUserTags);
      }));
    }

    // update new tags
    await Promise.all(tags.map(async (tag) => {
      const paramsTagUser = {
        Item: {
          tag_id: tag,
          user_id: userId,
          created_at: getCurrentTimestamp(),
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: DYNAMO_TABLE_USER_TAG,
      };

      await docClientPut(paramsTagUser);
    }));

    // password change
    if (password && previousPassword) {
      await changePassword(accessToken, previousPassword, password);
    }

    return {
      message: 'UserUpdatedSuccessfully',
      statusCode: 200,
    };
  } catch (error) {
    if (error.code === 'NotAuthorizedException') {
      throw InterceptError('IncorrectPassword', 400);
    }
    if (error.code === 'LimitExceededException') {
      throw InterceptError('PasswordLimitExceeded', 400);
    }
    console.log('Error on edit user information', error);
    throw error;
  }
};

module.exports = {
  allUsersInfo,
  usersInfo,
  editUsersInfo,
};

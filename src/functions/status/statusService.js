/**
 * Get application health status
 * Eg. dynamodb connection, etc.
 */
const { docClientGetItem } = require('#utils/dynamoDbHelper');
const { DYNAMO_TABLE_STATUS } = require('#utils/constants');

/**
 *
 * @param {*} data request object
 * @returns response as JSON
 */
const status = async (data) => {
  const { time } = data;
  const params = {
    TableName: DYNAMO_TABLE_STATUS,
    Key: {
      id: 1,
    },
  };

  let dynamoDbRes = null;

  // Read status table from DynamoDb
  try {
    dynamoDbRes = await docClientGetItem(params);
  } catch (e) {
    dynamoDbRes = 'error';
  }

  return {
    message: 'success',
    data: {
      client_time: time,
      server_time: new Date().toISOString(),
      services_status: {
        dynamodb: dynamoDbRes === 'error' ? 'failed' : 'connected',
      },
    },
  };
};

module.exports = {
  status,
};

/**
 * Dynamodb custom connection strings and custom wrappers
 *
 */
const AWS = require('aws-sdk');

// Update necessary configs/credentials
AWS.config.update({ region: process.env.LAMBDA_REGION });

// Using document client abstract
const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

// Get data for a given filter
const docClientGetItem = (params) => documentClient.get(params).promise();

// Get data for a given filter
const docClientQuery = (params) => documentClient.query(params).promise();

// Create a new item
const docClientPut = (params) => documentClient.put(params).promise();

// Update existing item entry
const docClientUpdate = (params) => documentClient.update(params).promise();

// Delete item
const docClientDelete = (params) => documentClient.delete(params).promise();

// Get Batch item
const docClientGetBatchItems = (params) => documentClient.batchGet(params).promise();

// Scan items
const docClientScan = (params) => documentClient.scan(params).promise();

module.exports = {
  documentClient,
  docClientGetItem,
  docClientQuery,
  docClientPut,
  docClientUpdate,
  docClientDelete,
  docClientScan,
  docClientGetBatchItems,
};

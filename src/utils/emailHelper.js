/**
 * Email helper for application. Using AWS SES as a provider
 *
 */
const AWS_SES = require('aws-sdk');
const { SENDER_EMAIL } = require('#utils/constants');

AWS_SES.config.update({ region: process.env.LAMBDA_REGION });

const emailClient = new AWS_SES.SES({ apiVersion: '2010-12-01' });

/**
 * Send text based emails
 * @param {*} subject Email subject
 * @param {*} contents Email body
 * @param {*} to To email address
 * @param {*} cc Copy email
 * @returns Status from AWS
 */
const sendTextEmail = (subject, contents, to = [], cc = []) => {
  const params = {
    Destination: {
      CcAddresses: cc,
      ToAddresses: to,
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: contents,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: SENDER_EMAIL,
  };

  return emailClient.sendEmail(params).promise();
};

/**
 * Send SES template based emails
 * @param {*} to Reciever email
 * @param {*} templateData Parameters which need to pass to template
 * @returns Status from SWS SES
 */
const sendTemplateEmail = (to, templateName, templateData) => {
  const params = {
    Source: SENDER_EMAIL,
    Template: templateName,
    Destination: {
      ToAddresses: to,
    },
    TemplateData: templateData,
  };

  return emailClient.sendTemplatedEmail(params).promise();
};

module.exports = {
  sendTextEmail,
  sendTemplateEmail,
};

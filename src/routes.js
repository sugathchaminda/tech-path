/**
 * All application routes
 *
 * Follow the Swagger (OpenApi 3) documentation pattern when writing comments for each route
 */
const { healthChecker } = require('#functions/status/statusController');
const { getUsersInfo, getAllUsersInfo, editUsersInfo } = require('#functions/user/userInfoController');

const {
  createUser,
  verifyUser,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require('#functions/create_user/createUserController');
const { signInUser, signOutUser } = require('#functions/user_auth/userAuthController');

module.exports.load = (api) => {
  // for preflight
  api.options('/*', (req, res) => {
    res.cors().send({});
  });

  /**
    * @swagger
    * /v1/common/status:
    *   post:
    *    summary: Returns status of list of AWS services used by Techpath app
    *    description: Some response properties can decide health of the application
    *    consumes:
    *     - application/json
    *    parameters:
    *      - name: body
    *        in: body
    *        required: true
    *        description: Request body JSON pass to API
    *        schema:
    *         type: object
    *         required:
    *         - time
    *         properties:
    *           time:
    *             type: date
    *             description: Current browser time in unix format
    *         example:
    *           time: 2022-04-19 07:22:17
    *    responses:
    *     200:
    *      description: Returns a bunch of information.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message
    *        client_time:
    *         type: string
    *         description: The time passed from browser
    *        server_time:
    *         type: string
    *         description: The server time
    *        dynamodb:
    *         type: string
    *         description: The status of dynamoDB connection from application
    *      examples:
    *       application/json:
    *        {
    *          "message": "success",
    *          "data": {
    *            "client_time": "2022-04-19 07:22:17",
    *            "server_time": "2022-04-25T07:29:21.779Z",
    *            "services_status": {
    *              "dynamodb": "failed"
    *            }
    *          }
    *        }
    */
  api.post('/common/status', healthChecker);

  /**
    * @swagger
    * /v1/auth/create-user:
    *   post:
    *     summary: Create a new SME user
    *     description: Create any type of SME user
    *     consumes:
    *       - application/json
    *     parameters:
    *       - name: body
    *         in: body
    *         required: true
    *         description: Request body JSON pass to API
    *         schema:
    *           type: object
    *           required:
    *           - first_name
    *           - surname
    *           - job_title
    *           - email
    *           - password
    *           - site_id
    *           properties:
    *             first_name:
    *               type: string
    *               description: User first name
    *             surname:
    *               type: string
    *               description: User surname
    *             job_title:
    *               type: string
    *               description: User job title
    *             email:
    *               type: string
    *               description: User email. Only organisation emails are allowed when SME admin register first time
    *             password:
    *               type: string
    *               description: User password
    *             site_id:
    *               type: string
    *               description: Site ID belong this user
    *           example:
    *             first_name: Bob
    *             surname: Alic,
    *             job_title: developer,
    *             email: bob@newpath.com,
    *             password: "@Abc123"
    *             site_id: 01G562W6T8HCE2ZDCANTPTFV1Q
    *     responses:
    *       200:
    *         description: Returns a created user information.
    *         schema:
    *           type: object
    *           properties:
    *             messageCode:
    *               type: string
    *               description: API response status message code
    *             first_name:
    *               type: string
    *               description: The created user first name
    *             surname:
    *               type: string
    *               description: The created user surname
    *             job_title:
    *               type: string
    *               description: The created user job title
    *             email:
    *               type: string
    *               description: The created user email
    *             site_id:
    *               type: string
    *               description: The created user site ID
    *         examples:
    *           application/json:
    *             {
    *               "messageCode": "UserCreatedSuccessfully",
    *               "data": {
    *                 "first_name": "Bob",
    *                 "surname": "Alice",
    *                 "job_title": "developer",
    *                 "email": "bob@newpath.com",
    *                 "site_id": "01G562W6T8HCE2ZDCANTPTFV1Q"
    *               }
    *             }
    *       400:
    *         description: Error field validations
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code. Possible codes ['UserAlreadyExists', 'OnlyOrgEmailsAreAllowed']
    *             statusCode:
    *               type: string
    *               description: Http error code
    *         examples:
    *           application/json:
    *            {
    *              "statusCode": 400,
    *              "message": "UserAlreadyExists"
    *            }
    */
  api.post('/auth/create-user', createUser);

  /**
    * @swagger
    * /v1/auth/verify-account:
    *   get:
    *    summary: Verify SME user email address
    *    description: When SME register with the system, email address has to be verify
    *    consumes:
    *       - application/json
    *    parameters:
    *      - name: token
    *        in: query
    *        required: true
    *        description: Verification token
    *        schema:
    *         type: string
    *         required:
    *         - token
    *         properties:
    *           token:
    *             type: string
    *             description: Verification token
    *         example:
    *           time: xyz...
    *    responses:
    *     200:
    *      description: Token verified successfully.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message
    *        token:
    *         type: string
    *         description: Verified token
    *      examples:
    *       application/json:
    *        {
    *          "message": "EmailVerifiedSuccessfully",
    *          "data": {
    *            "token": "xyz...",
    *          }
    *        }
    *     400:
    *      description: Token expired.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message code. Possible codes ['TokenExpired', 'TokenInvalid', 'EmailAlreadyVerified']
    *        statusCode:
    *         type: string
    *         description: Http error code
    *      examples:
    *       application/json:
    *        {
    *          "statusCode": 400,
    *          "message": "TokenExpired"
    *        }
    */
  api.get('/auth/verify-account/:token', verifyUser);

  /**
    * @swagger
    * /v1/auth/resend-verification:
    *   post:
    *    summary: Resend email verification code
    *    description: When SME lost account verification email will send it again
    *    parameters:
    *      - name: body
    *        in: body
    *        required: true
    *        description: Request body
    *        schema:
    *         type: string
    *         required:
    *         - email
    *         - site_id
    *         properties:
    *           email:
    *             type: string
    *             description: SME user registered email
    *           site_id:
    *             type: string
    *             description: Site ID which SME belongs
    *         example:
    *           email: bob@newpath.com
    *           site_id: 01G562W6T8HCE2ZDCANTPTFV1Q
    *    responses:
    *     200:
    *      description: Verification code resend succuessfully.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message
    *        email:
    *         type: string
    *         description: Requested email
    *        site_id:
    *         type: string
    *         description: Requested site ID
    *      examples:
    *       application/json:
    *        {
    *          "message": "EmailVerificationSent",
    *          "data": {
    *            "email": "bob@newpath.com",
    *            "site_id": "01G562W6T8HCE2ZDCANTPTFV1Q"
    *          }
    *        }
    *     400:
    *      description: Verification resending failure.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message code. Possible codes ['InvalidEmailAddress', 'EmailAlreadyVerified']
    *        statusCode:
    *         type: string
    *         description: Http error code
    *      examples:
    *       application/json:
    *         {
    *           "statusCode": 400,
    *           "message": "EmailAlreadyVerified"
    *         }
    */
  api.post('/auth/resend-verification', resendVerification);

  /**
    * @swagger
    * /v1/auth/sign-in:
    *   post:
    *     summary: Sign in a new SME user
    *     description: Sign in to the SME
    *     consumes:
    *       - application/json
    *     parameters:
    *       - name: body
    *         in: body
    *         required: true
    *         description: Request body JSON pass to API
    *         schema:
    *           type: object
    *           required:
    *           - email
    *           - password
    *           properties:
    *             email:
    *               type: string
    *               description: User email.
    *             password:
    *               type: string
    *               description: User password
    *           example:
    *             email: bob@newpath.com,
    *             password: "@Abc123"
    *     responses:
    *       200:
    *         description: Returns a signed user.
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code
    *             accessToken:
    *               type: string
    *               description: Jwt token of the user
    *             id:
    *               type: string
    *               description: Id of the user
    *             email:
    *               type: string
    *               description: The created user email
    *             name:
    *               type: string
    *               description: First name and the surname of the user
    *             organisationSetupCompleted:
    *               type: boolean
    *               description: User set up status with the organisation
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserSignedSuccessfully",
    *               "data": {
    *                 "accessToken": "qq21214d4rgdg@#$$",
    *                 "id": "1234555",
    *                 "name": "bob mali",
    *                 "email": "bob@newpath.com",
    *                 "role": "developer",
    *                 "organisationSetupCompleted": "232fsdfs434343"
    *               }
    *             }
    *       400:
    *         description: Error field validations
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code. Possible codes ['EmailNotVerified, UserNotExists']
    *         examples:
    *           application/json:
    *             {
    *               "message": "EmailNotVerified"
    *             }
    */
  // api.post('/sign-in', signInUser);
  api.post('/auth/sign-in', signInUser);

  /**
    * @swagger
    * /v1/auth/sign-out:
    *   post:
    *     summary: Sign out SME user
    *     description: Sign out  SME user
    *     consumes:
    *       - application/json
    *     parameters:
    *       - name: body
    *         in: body
    *         required: true
    *         description: Request body JSON pass to API
    *         schema:
    *           type: object
    *           required:
    *           - accessToken
    *           properties:
    *             accessToken:
    *               type: string
    *               description: Logged user access token
    *           example:
    *             accessToken:ddsfssd5565thryhrwegvbfbnfhr
    *     responses:
    *       200:
    *         description: Returns a signed user.
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserSignedOutSuccessfully"
    *             }
    *       400:
    *         description: Error field validations
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code. Possible codes ['InvalidAccessToken, UserNotExists']
    *         examples:
    *           application/json:
    *             {
    *               "message": "InvalidAccessToken"
    *             }
    */
  api.post('/auth/sign-out', signOutUser);

  /**
    * @swagger
    * /v1/auth/forgot-password:
    *   post:
    *    summary: Send forgot password request
    *    description: Forgot password request send to server using username (email address)
    *    parameters:
    *      - name: body
    *        in: body
    *        required: true
    *        description: Request body
    *        schema:
    *         type: string
    *         required:
    *         - email
    *         - site_id
    *         properties:
    *           email:
    *             type: string
    *             description: SME user registered email
    *           site_id:
    *             type: string
    *             description: Site ID which SME belongs
    *         example:
    *           email: bob@newpath.com
    *           site_id: 01G562W6T8HCE2ZDCANTPTFV1Q
    *    responses:
    *     200:
    *      description: Password reset email sent.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message
    *        email:
    *         type: string
    *         description: Requested email
    *        site_id:
    *         type: string
    *         description: Requested site ID
    *      examples:
    *       application/json:
    *        {
    *          "message": "PasswordResetEmailSent",
    *          "data": {
    *            "email": "bob@newpath.com",
    *            "site_id": "01G562W6T8HCE2ZDCANTPTFV1Q"
    *          }
    *        }
    *     400:
    *      description: Password reset request failure.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message code. Possible codes ['InvalidEmailAddress', 'EmailNotVerified']
    *        statusCode:
    *         type: string
    *         description: Http error code
    *      examples:
    *       application/json:
    *         {
    *           "statusCode": 400,
    *           "message": "InvalidEmailAddress"
    *         }
    */
  api.post('/auth/forgot-password', forgotPassword);

  /**
    * @swagger
    * /v1/auth/reset-password:
    *   post:
    *    summary: Reset SME user password
    *    description: Reset SME user account via forgot password
    *    parameters:
    *      - name: body
    *        in: body
    *        required: true
    *        description: Request body
    *        schema:
    *         type: string
    *         required:
    *         - email
    *         - site_id
    *         - password
    *         - token
    *         properties:
    *           email:
    *             type: string
    *             description: SME user registered email
    *           site_id:
    *             type: string
    *             description: Site ID which SME belongs
    *           password:
    *             type: string
    *             description: SME user new password
    *           token:
    *             type: string
    *             description: Verification token sent when forgot password request
    *         example:
    *           email: bob@newpath.com
    *           site_id: 01G562W6T8HCE2ZDCANTPTFV1Q
    *           password: "@Abc123"
    *           token: xyZAbe...
    *    responses:
    *     200:
    *      description: Password reset successfully.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message
    *        email:
    *         type: string
    *         description: Requested email
    *        site_id:
    *         type: string
    *         description: Requested site ID
    *      examples:
    *       application/json:
    *        {
    *          "message": "PasswordResetSuccessfully",
    *          "data": {
    *            "email": "bob@newpath.com",
    *            "site_id": "01G562W6T8HCE2ZDCANTPTFV1Q"
    *          }
    *        }
    *     400:
    *      description: Password reset failure.
    *      schema:
    *       type: object
    *       properties:
    *        message:
    *         type: string
    *         description: API response status message code. Possible codes ['InvalidToken']
    *        statusCode:
    *         type: string
    *         description: Http error code
    *      examples:
    *       application/json:
    *         {
    *           "statusCode": 400,
    *           "message": "InvalidToken"
    *         }
    */
  api.post('/reset-password', resetPassword);

  /**
    * @swagger
    * /v1/user/profile/:user_id:
    *   get:
    *     summary: Get user profile
    *     description: Get user profile information
    *     parameters:
    *     - in: path
    *       name: userId
    *       schema:
    *         type: string
    *       required: true
    *     responses:
    *       200:
    *         description: Returns user profile.
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code
    *             userId:
    *               type: string
    *               description: Id of the user
    *             firstName:
    *               type: string
    *               description: First name of the user
    *             lastName:
    *               type: string
    *               description: Last name of the user
    *             email:
    *               type: string
    *               description: The created user email
    *             jobTitle:
    *               type: string
    *               description: Job title of the user
    *             tags:
    *               type: object
    *               description: Tags of user
    *             role:
    *               type: string
    *               description: Role of the user
    *             approvingCount:
    *               type: integer
    *               description: Approvign count of user
    *             approver:
    *               type: string
    *               description: Approver of user
    *             approvedProducts:
    *               type: string
    *               description: Approved products of user
    *             budgetUsed:
    *               type: integer
    *               description: Used budget of user
    *             address:
    *               type: object
    *               description: User and SME address
    *             requestId:
    *               type: string
    *               description: Request user id
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserFetchedSuccessfully",
    *               "data": {
    *                "user": {
    *                   "userId": "01G741FCNTEENK8ZB3YKB6HJYG",
    *                   "firstName": "John",
    *                   "lastName": "Doe",
    *                   "email": "p.senadheera@newpath.com",
    *                   "jobTitle": "Developer",
    *                   "tags": [
    *                       "Everyone"
    *                   ],
    *                   "role": "admin",
    *                   "approvingCount": 2,
    *                   "approver": null,
    *                   "approvedProducts": 2,
    *                   "budgetUsed": 3000,
    *                   "address": {
    *                     "sme": {
    *                       "SMEDeliveryName": "dddd",
    *                       "SMEDeliveryAddressLine1": ""
    *                      },
    *                     "user": {
    *                       "deliveryAddressLine1": "sss",
    *                       "deliveryAddressLine2": ""
    *                     }
    *                   }
    *               },
    *               "requestId": "01G741FCNTEENK8ZB3YKB6HJYG"
    *                 }
    *             }
    *       400:
    *         description: Error field validations
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code. Possible codes ['UserNotFound']
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserNotFound"
    *             }
    */
  api.get('/user/:userId', getUsersInfo);

  /**
    * @swagger
    * /v1/user/all:
    *   get:
    *     summary: Get all users profile
    *     description: Get user profile information
    *     responses:
    *       200:
    *         description: Returns all user profiles.
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code
    *             userId:
    *               type: string
    *               description: Id of the user
    *             firstName:
    *               type: string
    *               description: First name of the user
    *             lastName:
    *               type: string
    *               description: Last name of the user
    *             email:
    *               type: string
    *               description: The created user email
    *             jobTitle:
    *               type: string
    *               description: Job title of the user
    *             tags:
    *               type: object
    *               description: Tags of user
    *             role:
    *               type: string
    *               description: Role of the user
    *             approvingCount:
    *               type: integer
    *               description: Approvign count of user
    *             approver:
    *               type: string
    *               description: Approver of user
    *             approvedProducts:
    *               type: string
    *               description: Approved products of user
    *             budgetUsed:
    *               type: integer
    *               description: Used budget of user
    *             address:
    *               type: object
    *               description: User and SME address
    *             requestId:
    *               type: string
    *               description: Request user id
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserFetchedSuccessfully",
    *               "data": {
    *                "user": {
    *                   "userId": "01G741FCNTEENK8ZB3YKB6HJYG",
    *                   "firstName": "John",
    *                   "lastName": "Doe",
    *                   "email": "p.senadheera@newpath.com",
    *                   "jobTitle": "Developer",
    *                   "tags": [
    *                       "Everyone"
    *                   ],
    *                   "role": "admin",
    *                   "approvingCount": 2,
    *                   "approver": null,
    *                   "approvedProducts": 2,
    *                   "budgetUsed": 3000,
    *                   "address": {
    *                     "sme": {
    *                       "SMEDeliveryName": "dddd",
    *                       "SMEDeliveryAddressLine1": ""
    *                      },
    *                     "user": {
    *                       "deliveryAddressLine1": "sss",
    *                       "deliveryAddressLine2": ""
    *                     }
    *                   }
    *               },
    *               "requestId": "01G741FCNTEENK8ZB3YKB6HJYG"
    *                 }
    *             }
    *       400:
    *         description: Error field validations
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code. Possible codes ['UserNotFound']
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserNotFound"
    *             }
    */
  api.get('/user/all', getAllUsersInfo);

  /**
    * @swagger
    * /v1/user/profile/:user_id:
    *   get:
    *     summary: Get user profile
    *     description: Get user profile information
    *     parameters:
    *     - in: path
    *       name: userId
    *       schema:
    *         type: string
    *       required: true
    *     responses:
    *       200:
    *         description: Returns user profile.
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code
    *             userId:
    *               type: string
    *               description: Id of the user
    *             firstName:
    *               type: string
    *               description: First name of the user
    *             lastName:
    *               type: string
    *               description: Last name of the user
    *             email:
    *               type: string
    *               description: The created user email
    *             jobTitle:
    *               type: string
    *               description: Job title of the user
    *             tags:
    *               type: object
    *               description: Tags of user
    *             role:
    *               type: string
    *               description: Role of the user
    *             approvingCount:
    *               type: integer
    *               description: Approvign count of user
    *             approver:
    *               type: string
    *               description: Approver of user
    *             approvedProducts:
    *               type: string
    *               description: Approved products of user
    *             budgetUsed:
    *               type: integer
    *               description: Used budget of user
    *             address:
    *               type: object
    *               description: User and SME address
    *             requestId:
    *               type: string
    *               description: Request user id
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserFetchedSuccessfully",
    *               "data": {
    *                "user": {
    *                   "userId": "01G741FCNTEENK8ZB3YKB6HJYG",
    *                   "firstName": "John",
    *                   "lastName": "Doe",
    *                   "email": "p.senadheera@newpath.com",
    *                   "jobTitle": "Developer",
    *                   "tags": [
    *                       "Everyone"
    *                   ],
    *                   "role": "admin",
    *                   "approvingCount": 2,
    *                   "approver": null,
    *                   "approvedProducts": 2,
    *                   "budgetUsed": 3000,
    *                   "address": {
    *                     "sme": {
    *                       "SMEDeliveryName": "dddd",
    *                       "SMEDeliveryAddressLine1": ""
    *                      },
    *                     "user": {
    *                       "deliveryAddressLine1": "sss",
    *                       "deliveryAddressLine2": ""
    *                     }
    *                   }
    *               },
    *               "requestId": "01G741FCNTEENK8ZB3YKB6HJYG"
    *                 }
    *             }
    *       400:
    *         description: Error field validations
    *         schema:
    *           type: object
    *           properties:
    *             message:
    *               type: string
    *               description: API response status message code. Possible codes ['UserNotFound']
    *         examples:
    *           application/json:
    *             {
    *               "message": "UserNotFound"
    *             }
    */
  api.put('/user/:userId', editUsersInfo);

  api.post('/auth/reset-password', resetPassword);

  api.get('/sme', () => ({ status: 'view SME' }));
};

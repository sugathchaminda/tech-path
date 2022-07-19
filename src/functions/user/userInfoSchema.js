/**
 * Validation for request
 */
const Joi = require('joi');

const usersInfo = () => Joi.object().keys({
  userId: Joi.string().required().label('User Id'),
});

const editUsersInfo = () => Joi.object().keys({
  userId: Joi.string().required().label('User Id'),
  firstName: Joi.string().required().label('First Name'),
  lastName: Joi.string().required().label('Last Name'),
  email: Joi.string().required().label('Email'),
  jobTitle: Joi.string().required().label('Job Title'),
  department: Joi.string().required().label('Department'),
  tags: Joi.array().required().label('Tags'),
  profilePicture: Joi.string().allow(null, '').label('Profile Picture'),
  reportsTo: Joi.string().allow(null, '').label('Reports To'),
  approver: Joi.string().allow(null, '').label('Approver'),
  productSendTo: Joi.string().required().label('Product Send To'),
  address: Joi.object({
    deliverName: Joi.string().allow(null, '').label('Deliver Name'),
    line1: Joi.string().allow(null, '').label('Line 1'),
    line2: Joi.string().allow(null, '').label('Line 2'),
    city: Joi.string().allow(null, '').label('City'),
    country: Joi.string().allow(null, '').label('Country'),
    postcode: Joi.string().allow(null, '').label('Postcode'),
  }),
  password: Joi.string().allow(null, '').optional().label('Password'),
  previousPassword: Joi.string().allow(null, '').optional().label('Previous Password'),
});

module.exports = {
  usersInfo,
  editUsersInfo,
};

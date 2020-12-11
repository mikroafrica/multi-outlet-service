"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changePassword = exports.resetPassword = exports.requestResetPassword = exports.validateEmail = exports.sendVerificationEmail = exports.loginMultiOutletOwner = exports.signupMultiOutletOwner = void 0;

var _joi = _interopRequireDefault(require("joi"));

var ConsumerService = _interopRequireWildcard(require("../../modules/consumer-service.js"));

var AuthService = _interopRequireWildcard(require("../../modules/auth-service.js"));

var _status = require("../../modules/status.js");

var _logger = _interopRequireDefault(require("../../../logger.js"));

var _userType = require("./user.type.js");

var _index = require("../../events/index.js");

var _userAccountEvent = _interopRequireDefault(require("../../events/user-account-event.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const signupMultiOutletOwner = async params => {
  if (!params) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: "Request body is required"
    });
  }

  const validateSchema = validateSignupParamsSchema(params);

  if (validateSchema.error) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: validateSchema.error.details[0].message
    });
  }

  return ConsumerService.signup(params).then(async outletOwnerData => {
    const userId = await outletOwnerData.data.id;

    try {
      await AuthService.signup(authServiceSignUpParams(params, userId));
      return Promise.resolve({
        statusCode: _status.OK,
        data: outletOwnerData.data
      });
    } catch (e) {
      _userAccountEvent.default.emit(_index.CLEAR_ACCOUNT_EVENT, userId);

      _logger.default.error(`User auth creation failed while at auth service with email ${params.email} with error ${JSON.stringify(e)}`);

      return Promise.reject({
        statusCode: _status.CONFLICT,
        message: "Account creation failed. Please try again"
      });
    }
  }).catch(err => {
    params = { ...params,
      password: ""
    };

    _logger.default.error(`Creating multi outlet owner of object ${JSON.stringify(params)} failed with error ${JSON.stringify(err)}`);

    return Promise.reject({
      statusCode: err.statusCode,
      message: JSON.parse(err.message).message
    });
  });
};

exports.signupMultiOutletOwner = signupMultiOutletOwner;

const authServiceSignUpParams = (params, userId) => {
  return {
    username: params.email,
    userId: userId,
    password: params.password,
    role: _userType.UserType.ADMIN
  };
};

const loginMultiOutletOwner = async ({
  params
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: "request body is required"
    });
  }

  const validateSchema = validateLoginSchema(params);

  if (validateSchema.error) {
    _logger.default.error(`Invalid params during login ${validateSchema.error.details[0].message}`);

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: validateSchema.error.details[0].message
    });
  }

  try {
    const loginResponse = await AuthService.login({
      username: params.email,
      password: params.password,
      role: "admin"
    });
    const userId = loginResponse.data.userId;

    try {
      const userDetails = await ConsumerService.getUserDetails(userId);
      loginResponse.data = { ...loginResponse.data,
        ...userDetails.data
      };
      return Promise.resolve({
        statusCode: _status.OK,
        data: loginResponse.data
      });
    } catch (e) {
      _logger.default.error(`An error occurred while fetching user details login ${e}`);

      if (e.statusCode === 403) {
        return Promise.reject({
          statusCode: e.statusCode,
          message: "User account is not verified",
          data: {
            userId
          }
        });
      }

      return Promise.reject({
        statusCode: e.statusCode || _status.BAD_REQUEST,
        message: JSON.parse(e.message).message
      });
    }
  } catch (e) {
    _logger.default.error(`An error occurred during login ${e}`);

    return Promise.reject({
      statusCode: e.statusCode || _status.BAD_REQUEST,
      message: JSON.parse(e.message).message
    });
  }
};

exports.loginMultiOutletOwner = loginMultiOutletOwner;

const sendVerificationEmail = async userId => {
  if (!userId) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: "User Id is required"
    });
  }

  try {
    const response = await ConsumerService.requestVerificationEmail({
      userId
    });
    response.data.userId = userId;
    return Promise.resolve({
      statusCode: _status.OK,
      data: response.data
    });
  } catch (e) {
    _logger.default.error("An error occurred while sending verification email");

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: JSON.parse(e.message).message
    });
  }
};

exports.sendVerificationEmail = sendVerificationEmail;

const validateEmail = async params => {
  const schema = _joi.default.object().keys({
    verificationId: _joi.default.string().required(),
    otpCode: _joi.default.string().required()
  });

  const validateSchema = _joi.default.validate(params, schema);

  if (validateSchema.error) {
    _logger.default.error(`Invalid params during signup ${validateSchema.error.details[0].message}`);

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: validateSchema.error.details[0].message
    });
  }

  try {
    const response = await ConsumerService.validateVerificationOtp(params);
    return Promise.resolve({
      statusCode: _status.OK,
      data: response.data
    });
  } catch (e) {
    _logger.default.error("An error occurred while verifying OTP sent to email");

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: JSON.parse(e.message).message
    });
  }
};

exports.validateEmail = validateEmail;

const requestResetPassword = async ({
  params
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: "request body is required"
    });
  }

  const validateSchema = validateRequestResetPasswordSchema(params);

  if (validateSchema.error) {
    _logger.default.error(`Invalid params during reset password request ${validateSchema.error.details[0].message}`);

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: validateSchema.error.details[0].message
    });
  }

  try {
    const resetPasswordRequestResponse = await AuthService.resetPasswordRequest({
      username: params.email
    });
    return Promise.resolve({
      statusCode: _status.OK,
      data: resetPasswordRequestResponse.data
    });
  } catch (e) {
    _logger.default.error("An error occurred when requesting for password reset");

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: JSON.parse(e.message).message
    });
  }
};

exports.requestResetPassword = requestResetPassword;

const resetPassword = async ({
  params
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: "request body is required"
    });
  }

  const validateSchema = validateResetPasswordSchema(params);

  if (validateSchema.error) {
    _logger.default.error(`Invalid params when resetting password ${validateSchema.error.details[0].message}`);

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: validateSchema.error.details[0].message
    });
  }

  try {
    const resetPasswordResponse = await AuthService.resetPassword(params);
    return Promise.resolve({
      statusCode: _status.OK,
      data: resetPasswordResponse.data
    });
  } catch (e) {
    _logger.default.error("An error occurred when resetting password");

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: JSON.parse(e.message).message
    });
  }
};

exports.resetPassword = resetPassword;

const changePassword = async ({
  params
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: "request body is required"
    });
  }

  const validateSchema = validateChangePasswordSchema(params);

  if (validateSchema.error) {
    _logger.default.error(`Invalid params when resetting password ${validateSchema.error.details[0].message}`);

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: validateSchema.error.details[0].message
    });
  }

  try {
    const resetPasswordResponse = await AuthService.changePassword(params);
    return Promise.resolve({
      statusCode: _status.OK,
      data: resetPasswordResponse.data
    });
  } catch (e) {
    _logger.default.error("An error occurred when changing password");

    return Promise.reject({
      statusCode: _status.BAD_REQUEST,
      message: JSON.parse(e.message).message
    });
  }
};

exports.changePassword = changePassword;

const validateSignupParamsSchema = params => {
  const schema = _joi.default.object().keys({
    personalPhoneNumber: _joi.default.string(),
    firstName: _joi.default.string().required(),
    lastName: _joi.default.string().required(),
    email: _joi.default.string().email(),
    phoneNumber: _joi.default.string(),
    password: _joi.default.string().required(),
    businessName: _joi.default.string().required(),
    address: _joi.default.string().required(),
    gender: _joi.default.string().required(),
    state: _joi.default.string().required(),
    lga: _joi.default.string().required(),
    profileImageId: _joi.default.string(),
    dob: _joi.default.string().required()
  });

  return _joi.default.validate(params, schema);
};

const validateLoginSchema = params => {
  const schema = _joi.default.object().keys({
    email: _joi.default.string().required(),
    password: _joi.default.string().required()
  });

  return _joi.default.validate(params, schema);
};

const validateRequestResetPasswordSchema = params => {
  const schema = _joi.default.object().keys({
    email: _joi.default.string().required()
  });

  return _joi.default.validate(params, schema);
};

const validateResetPasswordSchema = params => {
  const schema = _joi.default.object().keys({
    token: _joi.default.string().required(),
    password: _joi.default.string().required()
  });

  return _joi.default.validate(params, schema);
};

const validateChangePasswordSchema = params => {
  const schema = _joi.default.object().keys({
    userId: _joi.default.string().required(),
    currentPassword: _joi.default.string().required(),
    newPassword: _joi.default.string().required()
  });

  return _joi.default.validate(params, schema);
};
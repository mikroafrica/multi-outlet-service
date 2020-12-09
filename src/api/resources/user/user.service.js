import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as AuthService from "../../modules/auth-service.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import logger from "../../../logger.js";
import { UserType } from "./user.type.js";
import { CONFLICT, UN_AUTHORISED } from "../../modules/status.js";
import { CLEAR_ACCOUNT_EVENT } from "../../events/index.js";
import userAccountEmitter from "../../events/user-account-event.js";

export const signupMultiOutletOwner = async (params) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Request body is required",
    });
  }

  const validateSchema = validateSignupParamsSchema(params);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  logger.info(
    `Signup request with request body ${JSON.stringify({
      ...params,
      password: "",
    })}`
  );
  return ConsumerService.signup(params)
    .then(async (outletOwnerData) => {
      const userId = await outletOwnerData.data.id;

      try {
        await AuthService.signup(authServiceSignUpParams(params, userId));
        return Promise.resolve({
          statusCode: OK,
          data: outletOwnerData.data,
        });
      } catch (e) {
        userAccountEmitter.emit(CLEAR_ACCOUNT_EVENT, userId);
        logger.error(
          `User auth creation failed while at auth service with email ${
            params.email
          } with error ${JSON.stringify(e)}`
        );
        return Promise.reject({
          statusCode: CONFLICT,
          message: "Account creation failed. Please try again",
        });
      }
    })
    .catch((err) => {
      params = { ...params, password: "" };
      logger.error(
        `Creating multi outlet owner of object ${JSON.stringify(
          params
        )} failed with error ${JSON.stringify(err)}`
      );

      return Promise.reject({
        statusCode: err.statusCode,
        message: JSON.parse(err.message)?.message,
      });
    });
};

const authServiceSignUpParams = (params, userId) => {
  return {
    username: params.email,
    userId: userId,
    password: params.password,
    role: UserType.ADMIN,
  };
};

export const loginMultiOutletOwner = async ({ params }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = validateLoginSchema(params);
  if (validateSchema.error) {
    logger.error(
      `Invalid params during login ${validateSchema.error.details[0].message}`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  const loginRequest = {
    username: params.email,
    password: params.password,
    role: "admin",
  };
  logger.info(
    `Login request with request body ${JSON.stringify({
      ...loginRequest,
      password: "",
    })}`
  );
  try {
    const loginResponse = await AuthService.login(loginRequest);
    const userId = loginResponse.data?.userId;

    try {
      const userDetails = await ConsumerService.getUserDetails(userId);
      loginResponse.data = { ...loginResponse.data, ...userDetails.data };
      return Promise.resolve({ statusCode: OK, data: loginResponse.data });
    } catch (e) {
      logger.error(`An error occurred while fetching user details login ${e}`);
      if (e?.statusCode === 403) {
        return Promise.reject({
          statusCode: e?.statusCode,
          message: "User account is not verified",
          data: { userId },
        });
      }
      return Promise.reject({
        statusCode: e?.statusCode || BAD_REQUEST,
        message: JSON.parse(e.message)?.message,
      });
    }
  } catch (e) {
    logger.error(`An error occurred during login ${e}`);
    return Promise.reject({
      statusCode: e?.statusCode || BAD_REQUEST,
      message: JSON.parse(e.message)?.message,
    });
  }
};

export const sendVerificationEmail = async (userId) => {
  if (!userId) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "User Id is required",
    });
  }

  logger.info(`Request to send verification email to user with id ${userId}`);
  try {
    const response = await ConsumerService.requestVerificationEmail({ userId });
    response.data.userId = userId;

    return Promise.resolve({
      statusCode: OK,
      data: response?.data,
    });
  } catch (e) {
    logger.error("An error occurred while sending verification email");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: JSON.parse(e.message)?.message,
    });
  }
};

export const validateEmail = async (params) => {
  const schema = Joi.object().keys({
    verificationId: Joi.string().required(),
    otpCode: Joi.string().required(),
  });

  const validateSchema = Joi.validate(params, schema);

  if (validateSchema.error) {
    logger.error(
      `Invalid params during signup ${validateSchema.error.details[0].message}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  logger.info(
    `Validate email address with request body ${JSON.stringify(params)}`
  );
  try {
    const response = await ConsumerService.validateVerificationOtp(params);

    return Promise.resolve({
      statusCode: OK,
      data: response?.data,
    });
  } catch (e) {
    logger.error("An error occurred while verifying OTP sent to email");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: JSON.parse(e.message)?.message,
    });
  }
};

export const requestResetPassword = async ({ params }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = validateRequestResetPasswordSchema(params);

  if (validateSchema.error) {
    logger.error(
      `Invalid params during reset password request ${validateSchema.error.details[0].message}`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  logger.info(
    `Requested a password reset with request body ${JSON.stringify(params)}`
  );
  try {
    const resetPasswordRequestResponse = await AuthService.resetPasswordRequest(
      { username: params.email }
    );

    return Promise.resolve({
      statusCode: OK,
      data: resetPasswordRequestResponse.data,
    });
  } catch (e) {
    logger.error("An error occurred when requesting for password reset");

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: JSON.parse(e.message)?.message,
    });
  }
};

export const resetPassword = async ({ params }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = validateResetPasswordSchema(params);

  if (validateSchema.error) {
    logger.error(
      `Invalid params when resetting password ${validateSchema.error.details[0].message}`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const resetPasswordResponse = await AuthService.resetPassword(params);
    return Promise.resolve({
      statusCode: OK,
      data: resetPasswordResponse.data,
    });
  } catch (e) {
    logger.error("An error occurred when resetting password");

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: JSON.parse(e.message)?.message,
    });
  }
};

export const changePassword = async ({ params }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = validateChangePasswordSchema(params);

  if (validateSchema.error) {
    logger.error(
      `Invalid params when resetting password ${validateSchema.error.details[0].message}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,

      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const resetPasswordResponse = await AuthService.changePassword(params);

    return Promise.resolve({
      statusCode: OK,
      data: resetPasswordResponse.data,
    });
  } catch (e) {
    logger.error("An error occurred when changing password");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: JSON.parse(e.message)?.message,
    });
  }
};

export const updateUser = async ({ params, userId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    phoneNumber: Joi.string(),
    businessName: Joi.string().required(),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
    profileImageId: Joi.string(),
    dob: Joi.string(),
  });

  const validateSchema = Joi.validate(params, schema);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const userDetails = await ConsumerService.getUserDetails(userId);
    const userDetailsData = userDetails.data;
    const isBvnVerified = userDetailsData.bvnVerified;

    // PREVENT A USER FROM UPDATING THEIR NAME, PHONE NUMBER OR DOB IF BVN IS VERIFIED
    if (isBvnVerified) {
      delete params.firstName;
      delete params.lastName;
      delete params.dob;
      delete params.phoneNumber;
    }

    logger.info(
      `Request body to update user ${userId} - ${JSON.stringify(params)}`
    );
    try {
      const updateUserResponse = await ConsumerService.updateUserProfile({
        params,
        userId,
      });
      const responseData = updateUserResponse.data;
      return Promise.resolve({
        statusCode: OK,
        data: responseData,
      });
    } catch (e) {
      logger.error(`An error occurred while updating user with error ${e}`);
      return Promise.reject({
        statusCode:
          JSON.parse(e.message)?.message ||
          "Could not update user profile. Please try again",
      });
    }
  } catch (e) {
    return Promise.reject({
      statusCode: "Could not update user profile. Please try again",
    });
  }
};

const validateSignupParamsSchema = (params) => {
  const schema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email(),
    phoneNumber: Joi.string(),
    password: Joi.string().required(),
    businessName: Joi.string().required(),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
    profileImageId: Joi.string(),
    dob: Joi.string().required(),
  });

  return Joi.validate(params, schema);
};

const validateLoginSchema = (params) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  return Joi.validate(params, schema);
};

const validateRequestResetPasswordSchema = (params) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
  });

  return Joi.validate(params, schema);
};

const validateResetPasswordSchema = (params) => {
  const schema = Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required(),
  });

  return Joi.validate(params, schema);
};

const validateChangePasswordSchema = (params) => {
  const schema = Joi.object().keys({
    userId: Joi.string().required(),
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  });

  return Joi.validate(params, schema);
};

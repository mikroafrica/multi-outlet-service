import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as AuthService from "../../modules/auth-service.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import logger from "../../../logger.js";
import { UserType } from "./user.type.js";
import { CONFLICT, UN_AUTHORISED } from "../../modules/status.js";
import { CLEAR_ACCOUNT_EVENT } from "../../events";
import userAccountEmitter from "../../events/user-account-event.js";
import { Owner } from "../../../../lib/api/resources/owner/owner.model";

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
    .then(async (outletOwner) => {
      const outletOwnerData = outletOwner.data;
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
        message: err.message,
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
    const loginResponseData = loginResponse.data;
    const userId = loginResponseData.data.userId;

    try {
      const userDetails = await ConsumerService.getUserDetails(userId);
      const userDetailsData = userDetails.data.data;

      // CHECK TO SEE THAT WALLET-ID HAS BEEN MAPPED TO USER ON THE OUTLET SERVICE
      const owner = await Owner.findOne({
        userId,
      });

      if (!owner) {
        if (
          userDetailsData.store.length > 0 &&
          userDetailsData.store[0].wallet.length > 0
        ) {
          const walletId = userDetailsData.store[0].wallet[0].id;

          const createdOwner = new Owner({ walletId, userId });
          await createdOwner.save();
        } else {
          return Promise.reject({
            statusCode: BAD_REQUEST,
            message: "Login failed. Try again",
          });
        }
      }

      loginResponseData.data = {
        ...loginResponseData.data,
        ...userDetailsData,
      };
      return Promise.resolve({ statusCode: OK, data: loginResponseData.data });
    } catch (e) {
      logger.error(
        `An error occurred while fetching user details login ${JSON.stringify(
          e
        )}`
      );
      if (e.statusCode === 403) {
        return Promise.reject({
          statusCode: e.statusCode,
          message: "User account is not verified",
          data: { userId },
        });
      }
      return Promise.reject({
        statusCode: e.statusCode || BAD_REQUEST,
        message: e.message,
      });
    }
  } catch (e) {
    logger.error(`An error occurred during login ${JSON.stringify(e)}`);
    return Promise.reject({
      statusCode: e.statusCode || BAD_REQUEST,
      message: e.message,
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
    const responseData = response.data;
    responseData.data.userId = userId;

    return Promise.resolve({
      statusCode: OK,
      data: responseData.data,
    });
  } catch (e) {
    logger.error("An error occurred while sending verification email");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message,
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
    const responseData = response.data;

    return Promise.resolve({
      statusCode: OK,
      data: responseData.data,
    });
  } catch (e) {
    logger.error("An error occurred while verifying OTP sent to email");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message,
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
    const responseData = resetPasswordRequestResponse.data;

    return Promise.resolve({
      statusCode: OK,
      data: responseData.data,
    });
  } catch (e) {
    logger.error("An error occurred when requesting for password reset");

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message,
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
    const responseData = resetPasswordResponse.data;
    return Promise.resolve({
      statusCode: OK,
      data: responseData.data,
    });
  } catch (e) {
    logger.error("An error occurred when resetting password");

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.mesage,
    });
  }
};

export const changePassword = async ({ params, ownerId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  params.userId = ownerId;
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
    const responseData = resetPasswordResponse.data;
    return Promise.resolve({
      statusCode: OK,
      data: responseData.data,
    });
  } catch (e) {
    logger.error("An error occurred when changing password");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message,
    });
  }
};

export const updateUser = async ({ params, ownerId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
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
    const userDetails = await ConsumerService.getUserDetails(ownerId);
    const userDetailsData = userDetails.data;
    const isBvnVerified = userDetailsData.data.bvnVerified;

    // PREVENT A USER FROM UPDATING THEIR NAME, PHONE NUMBER OR DOB IF BVN IS VERIFIED
    if (isBvnVerified) {
      delete params.firstName;
      delete params.lastName;
      delete params.dob;
      delete params.phoneNumber;
    }

    logger.info(
      `Request body to update user ${ownerId} - ${JSON.stringify(params)}`
    );
    try {
      const updateUserResponse = await ConsumerService.updateUserProfile({
        params,
        userId: ownerId,
      });
      const responseData = updateUserResponse.data;
      return Promise.resolve({
        statusCode: OK,
        data: responseData.data,
      });
    } catch (e) {
      logger.error(
        `An error occurred while updating user with error ${JSON.stringify(e)}`
      );
      return Promise.reject({
        statusCode:
          e.message || "Could not update user profile. Please try again",
      });
    }
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not update user profile. Please try again",
    });
  }
};

export const getUser = async ({ ownerId }) => {
  try {
    const userDetails = await ConsumerService.getUserDetails(ownerId);

    const userDetailsData = userDetails.data;

    return Promise.resolve({
      statusCode: OK,
      data: userDetailsData.data,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not fetch user details. Please try again",
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

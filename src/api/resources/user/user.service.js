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

  return ConsumerService.signup(params)
    .then(async (outletOwnerData) => {
      const userId = await outletOwnerData.data.id;

      try {
        await AuthService.signup(authServiceSignUpParams(params, userId));
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

      const verificationResponse = await sendVerificationEmail(userId);
      return Promise.resolve(verificationResponse);
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

  try {
    const loginResponse = await AuthService.login({
      username: params.email,
      password: params.password,
      role: "admin",
    });
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
  try {
    const response = await ConsumerService.requestVerificationEmail({ userId });
    response.data.userId = userId;

    return Promise.resolve({
      statusCode: OK,
      data: response?.data,
    });
  } catch (e) {
    logger.error("An error occurred while sending verification email");
    return Promise.reject({ statusCode: BAD_REQUEST, message: e });
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

  try {
    const response = await ConsumerService.validateVerificationOtp(params);

    return Promise.resolve({
      statusCode: OK,
      data: response?.data,
    });
  } catch (e) {
    logger.error("An error occurred while verifying OTP sent to email");
    return Promise.reject({ statusCode: BAD_REQUEST, message: e?.message });
  }
};

const validateSignupParamsSchema = (params) => {
  const schema = Joi.object().keys({
    referredCodeId: Joi.string().required(),
    personalPhoneNumber: Joi.string(),
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
    referralCode: Joi.string(),
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

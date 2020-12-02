import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import logger from "../../../logger.js";

export const signupMultiOutletOwner = async (params) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Request body is required",
    });
  }

  try {
    const signupResponse = await ConsumerService.signup(params);
    const userId = await signupResponse.data.id;
    const emailVerificationResponse = await sendVerificationEmail(userId);

    return Promise.resolve(emailVerificationResponse);
  } catch (e) {
    logger.error("An error occurred during signup");
    return Promise.reject({ statusCode: BAD_REQUEST, message: e });
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

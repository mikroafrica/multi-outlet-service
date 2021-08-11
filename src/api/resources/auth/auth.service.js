import { BAD_REQUEST, CONFLICT, OK } from "../../modules/status";
import logger from "../../../logger";
import * as AuthService from "../../modules/auth-service";
import * as AppService from "../../modules/app-service";
import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service";
import { Owner } from "../owner/owner.model";
import { TempOwner } from "../owner/temp.owner.model";
import { Approval, UserType } from "../owner/user.type";
import userAccountEmitter from "../../events/user-account-event";
import { CLEAR_ACCOUNT_EVENT } from "../../events";
import type { NotificationModel } from "../../events/slack/slack.event";
import emitter from "../../events/slack/slack.event";
import { SLACK_EVENT } from "../../events/slack";
import { UserRole } from "../owner/user.role";

export const requestResetPassword = async ({ params, isPartner }) => {
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
      {
        username: params.email,
        link: isPartner ? process.env.PARTNERS_DASHBOARD_URL : null,
      }
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
      message: e.message,
    });
  }
};

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

  params.personalPhoneNumber = params.phoneNumber;

  if (params.userType === UserType.PARTNER) {
    const zoneResponse = await AppService.getRegion({ state: params.state });
    const zoneData = zoneResponse.data;
    const zoneObject = zoneData.data;
    params = Object.assign(params, zoneObject);
  }

  logger.info(`::: User sign up request is [${JSON.stringify(params)}] :::`);

  return ConsumerService.signup(params, params.userType)
    .then(async (outletOwner) => {
      const outletOwnerData = outletOwner.data;
      const userId = await outletOwnerData.data.id;

      try {
        await AuthService.signup(authServiceSignUpParams(params, userId));
        const tempOwner = new TempOwner({
          userId,
          phoneNumber: params.phoneNumber,
          noOfOutlets: params.noOfOutlets,
          userType: params.userType,
        });
        await tempOwner.save();

        sendSlackNotification({ params });

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

const sendSlackNotification = ({ params }) => {
  const name = params.firstName + " " + params.lastName;
  const userType = params.userType;
  const phoneNumber = params.phoneNumber;
  const slack: NotificationModel = {
    title: "New User Signup.",
    message:
      "`Message:` New Signup on Mikro-Multi-Outlet Dashboard\n" +
      "`Name:` " +
      `${name}\n` +
      "`PhoneNumber:` " +
      `${phoneNumber}\n` +
      "`userType:` " +
      `${userType}`,
    channel: process.env.SLACK_USERS_CHANNEL,
  };
  emitter.emit(SLACK_EVENT, slack);
};

const authServiceSignUpParams = (params, userId) => {
  return {
    username: params.email,
    userId: userId,
    password: params.password,
    role: UserRole.ADMIN,
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
      let owner = await Owner.findOne({ userId });

      if (!owner) {
        if (
          userDetailsData.store.length > 0 &&
          userDetailsData.store[0].wallet.length > 0
        ) {
          const store = userDetailsData.store[0];
          const walletId = store.wallet[0].id;
          const tempOwner = await TempOwner.findOne({ userId });

          const createdOwner = new Owner({
            walletId,
            userId,
            phoneNumber: tempOwner ? tempOwner.phoneNumber : "",
            noOfOutlets: tempOwner ? tempOwner.noOfOutlets : "",
            userType: tempOwner ? tempOwner.userType : "",
          });
          await createdOwner.save();
          owner = createdOwner;

          if (owner.userType === UserType.OUTLET_OWNER) {
            owner.approval = Approval.APPROVED;
            await owner.save();
          } else {
            // check if the referral id is empty
            if (!owner.referralId) {
              const name = `${userDetailsData.firstName} ${userDetailsData.lastName}`;
              const phoneNumber = userDetailsData.phoneNumber;
              const zone = userDetailsData.zone;
              const { state, lga } = store;

              const referralResponse = await createReferral({
                name,
                phoneNumber,
                zone,
                state,
                lga,
              });
              logger.info(
                `::: Referral created for partner with userId [${userId}] is [${JSON.stringify(
                  referralResponse
                )}] :::`
              );
              const referralData = referralResponse.data;
              const referral = referralData.data;

              const { id, accessCode } = referral;
              owner.approval = Approval.PENDING;
              owner.referralId = id;
              owner.referralAccessCode = accessCode;
            }
            await owner.save();
          }
        } else {
          return Promise.reject({
            statusCode: BAD_REQUEST,
            message: "Login failed. Try again",
          });
        }
      }
      const store = userDetailsData.store[0];

      if (owner.userType === UserType.PARTNER && !owner.referralId) {
        const name = `${userDetailsData.firstName} ${userDetailsData.lastName}`;
        const phoneNumber = userDetailsData.personalPhoneNumber;
        const zone = userDetailsData.zone;
        const { state, lga } = store;

        const referralResponse = await createReferral({
          name,
          phoneNumber,
          zone,
          state,
          lga,
        });
        logger.info(
          `::: Referral created for partner with userId [${userId}] is [${referralResponse}] :::`
        );
        const referralData = referralResponse.data;
        const referral = referralData.data;

        const { id, accessCode } = referral;
        owner.approval = Approval.PENDING;
        owner.referralId = id;
        owner.referralAccessCode = accessCode;

        await owner.save();
      }

      const ownerAccountDetails = {
        accountName: store.accountName,
        accountNumber: store.accountNumber,
        bank: store.bank,
        bankCode: store.bankCode,
      };

      userDetailsData.phoneNumber = owner ? owner.phoneNumber : "";
      userDetailsData.noOfOutlets = owner ? owner.noOfOutlets : "";

      loginResponseData.data = {
        ...loginResponseData.data,
        ...ownerAccountDetails,
        ...userDetailsData,
        commissionStatus: owner.commissionStatus,
        referralId: owner.referralId,
        referralAccessCode: owner.referralAccessCode,
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

const createReferral = async ({ name, phoneNumber, zone, state, lga }) => {
  return ConsumerService.createReferral({
    name,
    phoneNumber,
    zone,
    lga,
    state,
  });
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

const validateSignupParamsSchema = (params) => {
  const schema = Joi.object()
    .keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      password: Joi.string().required(),
      gender: Joi.string().required(),
      noOfOutlets: Joi.string(),
      profileImageId: Joi.string(),
      state: Joi.string(),
      lga: Joi.string(),
      userType: Joi.string()
        .valid(UserType.OUTLET_OWNER, UserType.PARTNER)
        .required(),
    })
    .unknown(true);

  return Joi.validate(params, schema);
};

export const getLocation = async () => {
  try {
    const locationResponse = await AppService.getStates();
    const locationResponseData = locationResponse.data;
    return Promise.resolve({
      statusCode: OK,
      data: locationResponseData.data,
    });
  } catch (e) {
    logger.error(
      `::: failed to fetch location with error [${JSON.stringify(e)}] :::`
    );
    return Promise.reject({
      statusCode: e.statusCode || BAD_REQUEST,
      message: e.message || "Something went wrong. Please try again",
    });
  }
};

export const getLocalGovtByState = async ({ state }) => {
  try {
    const locationResponse = await AppService.getLocalGovt({ state });
    const locationResponseData = locationResponse.data;
    return Promise.resolve({
      statusCode: OK,
      data: locationResponseData.data,
    });
  } catch (e) {
    logger.error(
      `::: failed to fetch lga location with error [${JSON.stringify(e)}] :::`
    );
    return Promise.reject({
      statusCode: e.statusCode || BAD_REQUEST,
      message: e.message || "Something went wrong. Please try again",
    });
  }
};

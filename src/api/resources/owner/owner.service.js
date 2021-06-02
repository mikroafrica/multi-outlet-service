import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as AuthService from "../../modules/auth-service.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import logger from "../../../logger.js";
import { UserRole } from "./user.role.js";
import { CONFLICT } from "../../modules/status.js";
import { CLEAR_ACCOUNT_EVENT } from "../../events";
import userAccountEmitter from "../../events/user-account-event.js";
import { Owner } from "./owner.model";
import { TempOwner } from "./temp.owner.model";
import { UserType } from "./user.type";
import { Outlet } from "../outlet/outlet.model";
import { fetchOutletDetails } from "../outlet/outlet.service";

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
      let owner = await Owner.findOne({
        userId,
      });

      if (!owner) {
        if (
          userDetailsData.store.length > 0 &&
          userDetailsData.store[0].wallet.length > 0
        ) {
          const walletId = userDetailsData.store[0].wallet[0].id;
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
            owner.approval = Approval.PENDING;
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
      message: "Could not fetch owner details. Please try again",
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

  const schema = Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      gender: Joi.string(),
      profileImageId: Joi.string(),
    })
    .unknown(true);

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
      const owner = await Owner.findOne({ userId: ownerId });

      return Promise.resolve({
        statusCode: OK,
        data: {
          ...responseData.data,
          phoneNumber: owner ? owner.phoneNumber : "",
        },
      });
    } catch (e) {
      logger.error(
        `An error occurred while updating user with error ${JSON.stringify(e)}`
      );
      return Promise.reject({
        statusCode: e.statusCode,
        message:
          e.message || "Could not update owner profile. Please try again",
      });
    }
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not update owner profile. Please try again",
    });
  }
};

export const getUsers = async ({ usertype, page, limit }) => {
  try {
    const userType = UserType[usertype];

    if (!userType) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Invalid user type supplied. Please supply a valid user type",
      });
    }

    let filter = { userType: usertype };

    const owners = await Owner.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return Promise.resolve({
      statusCode: OK,
      data: {
        page: owners.page,
        pages: owners.pages,
        limit: owners.limit,
        total: owners.total,
        list: owners.docs,
      },
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not fetch users by type. Please try again",
    });
  }
};

export const getOwnerWithOutlets = async ({ ownerId, page, limit }) => {
  try {
    const outlets = await Outlet.paginate(
      {
        ownerId,
      },
      { page, limit, sort: { createdAt: -1 } }
    );

    // Retrieve partner's details from the consumer service
    const ownerDetails = await ConsumerService.getUserDetails(ownerId);
    const ownerDetailsData = ownerDetails.data.data;

    logger.info(
      `Return owner details data as ${JSON.stringify(ownerDetailsData)}`
    );

    // Find owner and extract data saved during login
    const owner = await Owner.findOne({ userId: ownerId });
    if (!owner) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Could not find owner.",
      });
    }

    let ownerData = [];
    ownerData.push({
      userType: owner.userType,
      approval: owner.approval,
      phoneNumber: ownerDetailsData.phoneNumber,
      firstName: ownerDetailsData.firstName,
      lastName: ownerDetailsData.lastName,
      dateOfBirth: ownerDetailsData.dateOfBirth,
      businessName: ownerDetailsData.businessName,
      businessType: ownerDetailsData.businessType,
      email: ownerDetailsData.email,
    });

    // Use the fetchOutletDetails method to fetch the details of users linked to partner
    const outletDetails = await fetchOutletDetails(outlets.docs);

    logger.info(`Returning user details as ${JSON.stringify(outletDetails)}`);

    return Promise.resolve({
      statusCode: OK,
      data: {
        page: outlets.page,
        pages: outlets.pages,
        limit: outlets.limit,
        total: outlets.total,
        ownerData,
        list: outletDetails,
      },
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not fetch partner",
    });
  }
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
      userType: Joi.string()
        .valid(UserType.OUTLET_OWNER, UserType.PARTNER)
        .required(),
    })
    .unknown(true);

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

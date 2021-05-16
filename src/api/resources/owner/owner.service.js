import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as AuthService from "../../modules/auth-service.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import logger from "../../../logger.js";
import { UserRole } from "./user.role.js";
import { CONFLICT, UN_AUTHORISED } from "../../modules/status.js";
import { CLEAR_ACCOUNT_EVENT } from "../../events";
import userAccountEmitter from "../../events/user-account-event.js";
import { Owner } from "./owner.model";
import { Partner } from "../outlet/partner.model";
import { Outletpartner } from "../outlet/outletpartner.model";
import { CommissionBalance } from "./commissionbalance.model";
import { TempOwner } from "./temp.owner.model";
import { Commission } from "./commission.model";
import { OutletStatus } from "../outlet/outlet.status";
import { UserType, PartnerApproval } from "./user.type";
import {
  CommissionType,
  TransactionType,
  WithdrawalLevel,
} from "./commission.type";
import { Outlet } from "../outlet/outlet.model";
import { Verification } from "../outlet/verification.model";
import { validatePhone } from "../../modules/util";
import { sendVerificationOtp } from "../outlet/outlet.service";

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

  return ConsumerService.signup(params)
    .then(async (outletOwner) => {
      const outletOwnerData = outletOwner.data;
      const userId = await outletOwnerData.data.id;

      try {
        await AuthService.signup(authServiceSignUpParams(params, userId));
        const tempOwner = new TempOwner({
          userId,
          phoneNumber: params.phoneNumber,
          noOfOutlets: params.noOfOutlets,
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
          });
          await createdOwner.save();
          owner = createdOwner;
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

export const createCommission = async ({
  params,
  ownerId,
  transaction,
  commissiontype,
  withdrawallevel,
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object().keys({
    condition: Joi.number().required(),
    multiplier: Joi.number().required(),
  });

  const validateSchema = Joi.validate(params, schema);

  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const withdrawalLevel = WithdrawalLevel[withdrawallevel];
    const transactionType = TransactionType[transaction];
    const commissionType = CommissionType[commissiontype];
    if (!commissionType) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message:
          "Invalid commission type supplied. Please supply a valid commission type",
      });
    }

    //update commission setting if already existing
    const existingCommissionSettings = await Commission.findOne({
      $or: [
        {
          $and: [
            { type: commissionType },
            { transactions: transactionType },
            { withdrawals: withdrawalLevel },
          ],
        },
        {
          $and: [
            { type: commissionType },
            { transactions: transactionType },
            { withdrawals: WithdrawalLevel.NA },
          ],
        },
        {
          $and: [
            { type: commissionType },
            { transactions: TransactionType.NIL },
            { withdrawals: WithdrawalLevel.NA },
          ],
        },
      ],
    });

    console.log("existingCommissionSettings", existingCommissionSettings);

    if (existingCommissionSettings) {
      await Commission.findOneAndUpdate(
        {
          $or: [
            {
              $and: [
                { type: commissionType },
                { transactions: transactionType },
                { withdrawals: withdrawalLevel },
              ],
            },
            {
              $and: [
                { type: commissionType },
                { transactions: transactionType },
                { withdrawals: WithdrawalLevel.NA },
              ],
            },
            {
              $and: [
                { type: commissionType },
                { transactions: TransactionType.NIL },
                { withdrawals: WithdrawalLevel.NA },
              ],
            },
          ],
        },
        {
          $set: { condition: params.condition, multiplier: params.multiplier },
        },
        { new: true }
      );
      return;
    }

    const commission = new Commission({
      condition: params.condition,
      multiplier: params.multiplier,
      owner: ownerId,
      type: commissionType,
      transactions: transactionType,
      withdrawals: withdrawalLevel,
    });

    await commission.save();

    logger.info(`commission created as ${commission}`);

    return Promise.resolve({
      statusCode: OK,
      data: commission,
    });
  } catch (err) {
    logger.error(
      `An error occurred while trying to create commission: ${JSON.stringify(
        err
      )}`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err.message || "Could not create commission. Please try again",
    });
  }
};

export const getPartnerApprovalStatus = async ({ userId }) => {
  try {
    // check for partner approval if he has commissions already set
    const partner = await Partner.findOne({ ownerId: userId });
    let returnedApprovalStatus;
    if (partner.approval === PartnerApproval.APPROVED) {
      returnedApprovalStatus = PartnerApproval.APPROVED;
    } else {
      const partnerCommission = await CommissionBalance.find({ owner: userId });

      if (partnerCommission && partnerCommission.length > 0) {
        partner.approval = PartnerApproval.APPROVED;
        await partner.save();
        returnedApprovalStatus = PartnerApproval.APPROVED;
      } else {
        returnedApprovalStatus = PartnerApproval.PENDING;
      }
    }

    return Promise.resolve({
      statusCode: OK,
      data: returnedApprovalStatus,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not confirm partner approval status",
    });
  }
};

export const getPartnerCommissionBalance = async ({
  userId,
  commissiontype,
}) => {
  try {
    const commissionType = CommissionType[commissiontype];
    // check for if the partner has commissions already set
    const partnerCommission = await CommissionBalance.find({ owner: userId });
    if (!partnerCommission) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Commission not set for partner",
      });
    }

    return Promise.resolve({
      statusCode: OK,
      data: partnerCommission,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not confirm partner approval status",
    });
  }
};

export const getPartnerCommissionSettings = async ({ ownerId }) => {
  try {
    const commissionSettings = await Commission.find({ owner: ownerId });
    if (!commissionSettings) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Commission rule is yet to be set",
      });
    }

    return Promise.resolve({
      statusCode: OK,
      data: commissionSettings,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not confirm partner approval status",
    });
  }
};

export const updatePartnerCommissionSettings = async ({
  params,
  commissionId,
  ownerId,
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  try {
    const updatedCommission = await Commission.findOneAndUpdate(
      {
        owner: ownerId,
        _id: commissionId,
      },
      { $set: { condition: params.condition, multiplier: params.multiplier } },
      { new: true }
    );

    console.log("updatedCommission", updatedCommission);

    return Promise.resolve({
      statusCode: OK,
      data: updatedCommission,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not update commission setting for partner",
    });
  }
};

export const getPartner = async ({ ownerId }) => {
  try {
    const partner = await Partner.findOne({ ownerId }).populate("users");
    if (!partner) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Partner could not be found",
      });
    }

    console.log("partner", partner);

    return Promise.resolve({
      statusCode: OK,
      data: partner,
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
      noOfOutlets: Joi.string().required(),
      profileImageId: Joi.string(),
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

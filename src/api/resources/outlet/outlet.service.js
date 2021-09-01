import Joi from "joi";
import async from "async";
import * as AuthService from "../../modules/auth-service.js";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as TransactionService from "../../modules/transaction-service.js";
import * as WalletService from "../../modules/wallet-service";
// import * as AppService from "../../modules/app-service";
import { Outlet } from "./outlet.model.js";
import { Owner } from "../owner/owner.model.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import {
  validatePhone,
  getRegionAndZoneFromState,
} from "../../modules/util.js";
import { Verification } from "./verification.model.js";
import { Commission } from "../commission/commission.model.js";
import logger from "../../../logger.js";
import { AuthServiceAction, OutletStatus } from "./outlet.status.js";
import { UserType } from "../owner/user.type";
import userAccountEmitter from "../../events/user-account-event";
import { CLEAR_ACCOUNT_EVENT } from "../../events";
import { UserRole } from "../owner/user.role";

export const createTempUser = (phoneNumber) => {
  if (!phoneNumber) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Phone number is required",
    });
  }

  return ConsumerService.tempUserCreation(phoneNumber)
    .then((responseData) => {
      const tempData = responseData.data;
      const { registrationId, expirationTimeInMilliSecs } = tempData.data;
      return Promise.resolve({
        statusCode: OK,
        data: {
          registrationId,
          expirationTimeInMilliSecs,
        },
      });
    })
    .catch((err) => {
      logger.error(
        `creating a temporary user failed with error ${JSON.stringify(err)}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message,
      });
    });
};

export const createNewOutlet = async ({ params, ownerId, registrationId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required.",
    });
  }

  const validateSchema = validateOutletCreationParams({ params });
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  params = Object.assign(params, { registrationId });

  const zone = params.zone;
  const acquisitionOfficers = await ConsumerService.referralByZone();
  const acquisitionOfficersByZones = acquisitionOfficers.data.data.zones;

  const referralObject = mapAcquisitionOfficerToUser({
    acquisitionOfficersByZones,
    zone,
  });

  console.log("referralObject", referralObject);

  const accessCode = referralObject.accessCode;
  const request = {
    accessCode,
    numberOfCodeGen: 1,
  };

  const referralCodeResponse = await ConsumerService.generateReferral(request);
  const referralCodeData = referralCodeResponse.data.data[0];
  const referredCodeId = referralCodeData.id;

  logger.info(
    `Referral code with id ${JSON.stringify(
      referredCodeId
    )} generated for outlet creation`
  );

  params.personalPhoneNumber = params.phoneNumber;

  // fetch owner data
  const userDetails = await ConsumerService.getUserDetails(ownerId);
  const userDetailsData = userDetails.data.data;

  const {
    firstName,
    lastName,
    profileImageId,
    gender,
    outletCount,
  } = userDetailsData;

  params = Object.assign(params, {
    registrationId,
    referredCodeId,
    firstName,
    lastName,
    gender,
    profileImageId,
    outletCount,
  });

  return ConsumerService.signup(params, params.userType)
    .then(async (outlet) => {
      const outletData = outlet.data;
      const userId = outletData.data.id;

      logger.info(
        `Outlet succesfully created with details ${JSON.stringify(outletData)}`
      );

      // Fetch the outlet data and get the walletId.
      // The user details has to be feched to have access to the user wallet
      // becasue wallet and outlet creation happen asynchronously.
      const outletDetails = await ConsumerService.getUserDetails(userId);
      const outletDetailsData = outletDetails.data.data;
      const walletId = outletDetailsData.store[0].wallet[0].id;

      const authServiceSignUpRequest = {
        username: params.phoneNumber,
        userId,
        password: params.pin,
        role: "outlet",
      };

      try {
        //  Sign up outlet on auth service
        const responseAuthData = await AuthService.signup(
          authServiceSignUpRequest
        );
        const createUserAuthData = responseAuthData.data;
        const accessToken = createUserAuthData.data.token;

        //  Verify if outlet already exists to prevent linking the same outlet more than once
        const existingOutlet = await Outlet.findOne({
          userId,
          ownerId,
        });
        logger.info(`Linking ${JSON.stringify(userId)}`);

        if (existingOutlet) {
          return Promise.reject({
            statusCode: BAD_REQUEST,
            message: "Outlet has been added previously",
          });
        }

        // Link outlet to owner
        const newOutletMapping = await saveNewOutletMapping({
          outletUserId: userId,
          ownerId,
          walletId,
        });

        return Promise.resolve({
          statusCode: OK,
          data: Object.assign(outletData.data, { accessToken }),
        });
      } catch (e) {
        userAccountEmitter.emit(CLEAR_ACCOUNT_EVENT, userId);
        logger.error(
          `An error occurred while creating outlet: ${JSON.stringify(err)}`
        );

        return Promise.reject({
          statusCode: BAD_REQUEST,
          message: err.message || "Could not link outlet. Please try again",
        });
      }
    })
    .catch((err) => {
      logger.error(
        `Creating outlet of object ${JSON.stringify(
          params
        )} failed with error ${JSON.stringify(err)}`
      );

      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message,
      });
    });
};

const mapAcquisitionOfficerToUser = ({ acquisitionOfficersByZones, zone }) => {
  let referralObject;
  for (let i = 0; i < acquisitionOfficersByZones.length; i++) {
    if (acquisitionOfficersByZones[i].referral.zone === zone) {
      referralObject = acquisitionOfficersByZones[i].referral;
    }
  }
  return referralObject;
};

const validateOutletCreationParams = ({ params }) => {
  const schema = Joi.object().keys({
    phoneNumber: Joi.string().required(),
    businessName: Joi.string().required(),
    address: Joi.string().required(),
    dob: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    email: Joi.string().email(),
    pin: Joi.string().required().length(4),
    lga: Joi.string().required(),
    zone: Joi.string().required(),
    userType: Joi.string().required(),
    merchantCategory: Joi.string(),
  });

  return Joi.validate(params, schema);
};

export const otpValidation = (registrationId, otpCode) => {
  if (!registrationId) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Registration id is required.",
    });
  }

  return ConsumerService.validateTempUserOtp({
    registrationId,
    otpCode,
    params: { registrationId },
  })
    .then((otpResponseData) => {
      const responseData = otpResponseData.data;
      const { registrationId, expirationTimeInMilliSecs } = responseData.data;
      return Promise.resolve({
        statusCode: otpResponseData.statusCode,
        data: {
          registrationId,
          expirationTimeInMilliSecs,
        },
      });
    })
    .catch((err) => {
      logger.error(
        `failed to validate OTP ${otpCode} with registration id ${registrationId} with error ${JSON.stringify(
          err
        )}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message,
      });
    });
};

export const linkOwnerToOutlet = async ({ params, ownerId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object().keys({
    phoneNumber: Joi.string().required(),
    pin: Joi.string().required(),
  });

  const validateSchema = Joi.validate(params, schema);

  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  let phoneNumber = "";
  try {
    phoneNumber = validatePhone({ phone: params.phoneNumber });
  } catch (err) {
    logger.error("An error occurred while linking outlet");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err,
    });
  }

  const loginRequest = {
    username: phoneNumber,
    password: params.pin,
    role: "outlet",
  };

  logger.info(
    `Outlet login with request [${JSON.stringify({ loginRequest, pin: "" })}]`
  );
  try {
    const loginResponse = await AuthService.loginWithPhoneNumber(loginRequest);
    const loginResponseData = loginResponse.data;

    const outletUserId = loginResponseData.data.userId;

    const existingOutlet = await Outlet.findOne({
      userId: outletUserId,
    });
    logger.info(`Linking ${JSON.stringify(outletUserId)}`);

    if (existingOutlet) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    const otpResponse = await sendVerificationOtp({
      phoneNumber: params.phoneNumber,
    });
    const otpResponseData = otpResponse.data;

    await saveVerification({
      verificationId: otpResponseData.id,
      outletUserId,
      ownerId,
      status: otpResponseData.verificationStatus,
    });

    return Promise.resolve({
      statusCode: OK,
      data: otpResponseData,
    });
  } catch (err) {
    logger.error(
      `An error occurred while trying to link outlet: ${JSON.stringify(err)}`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err.message || "Could not link outlet. Please try again",
    });
  }
};

export const linkOutletWithoutVerification = async ({ params, ownerId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object().keys({
    outletId: Joi.string().required(),
  });

  const validateSchema = Joi.validate(params, schema);

  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    // Retrieve outlet's dtails from consumer service
    const userDetails = await ConsumerService.getUserDetails(params.outletId);
    //
    const userDetailsData = userDetails.data;
    const userData = userDetailsData.data;
    const outletUserId = userData.id;
    const walletId = userData.store[0].wallet[0].id;

    logger.info(
      `Retrieving user details from consumer service as ${JSON.stringify(
        userDetails
      )}`
    );

    // check if outlet is already existing.
    const existingOutlet = await Outlet.findOne({
      userId: outletUserId,
      ownerId,
    });

    if (existingOutlet) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    const newOutletMapping = await saveOutletWithOwner({
      outletUserId,
      ownerId,
      walletId,
    });

    // await addCommissionToOwner({
    //   userDetails,
    //   outletUserId,
    //   ownerId,
    // });

    return Promise.resolve({
      statusCode: OK,
      data: newOutletMapping,
    });
  } catch (err) {
    logger.error(
      `An error occurred while trying to link outlet: ${JSON.stringify(err)}`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err.message || "Could not link outlet. Please try again",
    });
  }
};

const addCommissionToOwner = async ({ userDetails, outletUserId, ownerId }) => {
  // fetch user transaction details from the transaction service

  const timeCreated = userDetails.data.data.timeCreated;

  const dateFrom = timeCreated;
  const dateTo = timeCreated + 2592000000;
  // const dateTo = 1620770487650;

  const params = {
    userId: outletUserId,
    dateFrom,
    dateTo,
  };
  const outletTransactions = await TransactionService.transactionsCategorySummary(
    params
  );

  const outletTransactionData = outletTransactions.data.data;

  // filter transaction details to return transactions made within the first 30 days

  // apply logic commission based on the filtered transactions
  //   if filtered transaction sum >= minimum amount
  //        credit partner with commission multipler * transaction sum

  const totalTransactionAmount = outletTransactionData.reduce(
    (acc, transaction) => {
      if (transaction.successfulAmount) {
        return acc + transaction.successfulAmount;
      }
      return acc;
    },
    0
  );
  logger.info(
    `Total transaction amount for the first 30 of getting an outlet is calculated as ${totalTransactionAmount}`
  );

  const onboardingCommission = await Commission.findOne({
    type: "ONBOARDING",
    owner: ownerId,
  });

  logger.info(
    `Print onboarding commission setting as ${JSON.stringify(
      onboardingCommission
    )}`
  );

  if (
    onboardingCommission &&
    totalTransactionAmount >= onboardingCommission.condition
  ) {
    const commissionBalance = await CommissionBalance.findOne({
      owner: ownerId,
      type: "ONBOARDING",
    });

    logger.info(
      `Get owner onboarding commission balance as ${JSON.stringify(
        commissionBalance
      )}`
    );

    if (commissionBalance) {
      commissionBalance.amount =
        commissionBalance.amount +
        onboardingCommission.multiplier * totalTransactionAmount;
      await commissionBalance.save();
    } else {
      const commissionBalance = await CommissionBalance.create({
        amount: onboardingCommission.multiplier * totalTransactionAmount,
        owner: ownerId,
        type: "ONBOARDING",
      });
    }
  }

  //   TODO: THRIFT_ONBOARDING COMMISSIONS to be calculated when thrift users onboarded data is available
  //   if PARTNER has not been credited with thrift onboarding commission
  //     find thrift users onboarded by user and check if the users meet the contract terms
  //         if met
  //            credit PARTNER with the commission and
  //            set flag that the partner has been credited with thrift-onboarding commission

  //    TRANSACTION COMMISSIONS
  //   Filter transactions for every transfer (type TRANSFER) made by user
  //   that corresponds to settings (set by admin)

  const requests = {
    userId: outletUserId,
    dateFrom,
    dateTo: Date.now(),
  };

  const outletTransactionSummary = await TransactionService.transactionsCategorySummary(
    requests
  );
  const outletTransactionSummaryData = outletTransactionSummary.data.data;

  const filteredTransfer = outletTransactionSummaryData.filter(
    (transaction) =>
      transaction.type === "Transfer" && transaction.successfulAmount
  );

  //   if transfer exists
  const transferCommission = await Commission.findOne({
    type: "TRANSFER",
    owner: ownerId,
  });

  logger.info(
    `Get owner transfer commission settings as ${JSON.stringify(
      transferCommission
    )}`
  );

  if (filteredTransfer.length > 0) {
    const totalTransferAmount = filteredTransfer.reduce((acc, transaction) => {
      if (transaction.successfulAmount) {
        return acc + transaction.successfulAmount;
      }
      return acc;
    }, 0);

    const commissionOnTransfers =
      totalTransferAmount * transferCommission.multiplier;

    const commissionBalance = await CommissionBalance.findOne({
      owner: ownerId,
      type: "TRANSFER",
    });

    if (commissionBalance) {
      // credit owner for every transfer
      commissionBalance.amount =
        commissionBalance.amount + commissionOnTransfers;
      await commissionBalance.save();

      logger.info(
        `Get owners transfer commisision balance as ${commissionBalance.amount}`
      );
    } else {
      //  create a commissionBalance with amount === creditAmount
      const creditAmount = new CommissionBalance({
        amount: transferCommission.multiplier * filteredTransfer.length,
        owner: ownerId,
        type: "TRANSFER",
      });
      await creditAmount.save();
    }
  }

  //  Transfer transaction breakdown for the outlet under a user
  const request = {
    userId: outletUserId,
  };

  // Fetch transactions by outlet from the transactions service
  const transactionsByOutlet = await TransactionService.fetchTransactions(
    request
  );
  const transactionsByOutletData = transactionsByOutlet.data.data.list;

  const filteredTransferTransaction = transactionsByOutletData.filter(
    (tansaction) =>
      tansaction.transactionType === "transfer" &&
      tansaction.transactionStatus === "successful"
  );

  //   Calculate commission for each successful transfer by users under a partner
  if (filteredTransferTransaction.length > 0) {
    await async.forEach(filteredTransferTransaction, async (transfer) => {
      const commissionOnEachTransfer =
        transferCommission.multiplier * transfer.amount;

      //  check if transfer commission had been previously saved
      const transferCommissionBalance = await TransferCommission.findOne({
        timeCreated: transfer.timeCreated,
      });

      if (!transferCommissionBalance) {
        const commissionOnSingleTransfer = new TransferCommission({
          owner: ownerId,
          userId: outletUserId,
          transferAmount: transfer.amount,
          commissionOnTransfer: commissionOnEachTransfer,
          type: Type.TRANSFER,
          timeCreated: transfer.timeCreated,
        });
        await commissionOnSingleTransfer.save();
      }
    });
  }

  //   Filter transactions for every transaction (type WITHDRAWAL) made by user
  //   that corresponds to settings (set by admin)
  const filteredTransaction = outletTransactionSummaryData.filter(
    (transaction) =>
      transaction.type === "Withdrawal" && transaction.successfulAmount
  );

  //   if withdrawal TRANSACTION exists
  if (filteredTransaction.length > 0) {
    const totalWithdrawalAmount = filteredTransaction.reduce(
      (acc, transaction) => {
        if (transaction.successfulAmount) {
          return acc + transaction.successfulAmount;
        }
        return acc;
      },
      0
    );

    const withdrawalCommission = await Commission.find({
      type: "WITHDRAWAL",
      owner: ownerId,
    });

    logger.info(
      `Get the withdrawal commission setting as ${JSON.stringify(
        withdrawalCommission
      )}`
    );

    let condition1;
    let condition2;
    let condition3;
    let condition4;
    let condition5;
    if (withdrawalCommission[0].level === "level_one") {
      condition1 = withdrawalCommission[0].condition;
    } else if (withdrawalCommission[1].level === "level_two") {
      condition2 = withdrawalCommission[1].condition;
    } else if (withdrawalCommission[2].level === "level_three") {
      condition3 = withdrawalCommission[2].condition;
    } else if (withdrawalCommission[3].level === "level_four") {
      condition4 = withdrawalCommission[3].condition;
    } else if (withdrawalCommission[4].level === "level_five") {
      condition5 = withdrawalCommission[4].condition;
    }

    // calculate partner's credit amount based on the withdrawals level
    let creditAmount;
    if (totalWithdrawalAmount > condition1) {
      creditAmount = withdrawalCommission[0].multiplier * totalWithdrawalAmount;
    } else if (
      totalWithdrawalAmount > condition2 ||
      totalWithdrawalAmount <= condition1
    ) {
      creditAmount = withdrawalCommission[1].multiplier * totalWithdrawalAmount;
    } else if (
      totalWithdrawalAmount > condition3 ||
      totalWithdrawalAmount <= condition2
    ) {
      creditAmount = withdrawalCommission[2].multiplier * totalWithdrawalAmount;
    } else if (
      totalWithdrawalAmount > condition4 ||
      totalWithdrawalAmount <= condition3
    ) {
      creditAmount = withdrawalCommission[3].multiplier * totalWithdrawalAmount;
    } else if (totalWithdrawalAmount <= condition5) {
      creditAmount = withdrawalCommission[4].multiplier * totalWithdrawalAmount;
    }

    logger.info(`Computed credit amount ${creditAmount}`);

    const commissionBalance = await CommissionBalance.findOne({
      owner: ownerId,
      type: "WITHDRAWAL",
    });

    if (commissionBalance) {
      // credit partner for every transfer
      commissionBalance.amount = commissionBalance.amount + creditAmount;
      await commissionBalance.save();
    } else {
      //  create a commissionBalance with amount === creditAmount
      const newCreditAmount = await CommissionBalance.create({
        amount: creditAmount,
        owner: ownerId,
        type: "WITHDRAWAL",
      });
    }
  }
};

export const unlinkOutletFromOwner = async ({ ownerId, outletUserId }) => {
  try {
    logger.info(
      `Outlet owner ${ownerId} request to unlink outlet ${outletUserId}`
    );
    const existingOutlet = await Outlet.findOne({
      userId: outletUserId,
      ownerId,
    });
    if (!existingOutlet) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Outlet not found. Please supply a valid outlet",
      });
    }
    await Outlet.findOneAndDelete({
      userId: outletUserId,
      ownerId,
    });
    return Promise.resolve({
      statusCode: OK,
    });
  } catch (e) {
    logger.error(
      `Failed to unlink outlet with the following error ${JSON.stringify(e)}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not delete outlet. Try again",
    });
  }
};

export const switchOutletSuspendedStatus = async ({
  outletUserId,
  ownerId,
  status,
}) => {
  logger.info(`Outlet owner request to switch outlet status ${outletUserId}`);
  try {
    const outletStatus = OutletStatus[status];
    if (!outletStatus) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Invalid status supplied. Please supply a valid status",
      });
    }

    const existingOutlet = await Outlet.findOne({
      userId: outletUserId,
      ownerId,
    });
    if (!existingOutlet) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Could not find outlet",
      });
    }

    //UPDATE THE STATUS OF THE OUTLET AT THE AUTH SERVICE
    await AuthService.updateUserStatus({
      userId: outletUserId,
      status: AuthServiceAction[status],
    });

    const updatedOutlet = await Outlet.findOneAndUpdate(
      {
        userId: outletUserId,
        ownerId,
      },
      { $set: { status } },
      { new: true }
    );

    return Promise.resolve({
      statusCode: OK,
      data: updatedOutlet,
    });
  } catch (e) {
    logger.error(
      `Failed to suspend outlet ${outletUserId} with error ${JSON.stringify(e)}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not switch outlet status. Try again",
    });
  }
};

export const sendVerificationOtp = async ({ phoneNumber }) => {
  try {
    const params = { phoneNumber, type: "PHONE_NUMBER" };

    logger.info(
      `Request to link outlet with request body [${JSON.stringify(params)}]`
    );
    const otpResponse = await ConsumerService.generateOtp(params);
    return otpResponse.data;
  } catch (err) {
    logger.error("Could not send verification OTP");
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not send verification OTP",
    });
  }
};

const saveVerification = async ({
  verificationId,
  outletUserId,
  ownerId,
  status,
}) => {
  const existingVerification = await Verification.findOne({
    outletUserId,
    ownerId,
  });

  // UPDATE AN EXISTING VERIFICATION IF IT ALREADY EXISTS
  if (existingVerification) {
    await Verification.findOneAndUpdate(
      { outletUserId, ownerId },
      { $set: { verificationId } },
      { new: true }
    ).exec();
    return;
  }

  const verification = new Verification({
    verificationId,
    outletUserId,
    ownerId,
    status,
  });
  await verification.save();
};

export const verifyOutletLinking = async ({ params }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object().keys({
    otpCode: Joi.string().required(),
    verificationId: Joi.string().required(),
  });

  const validateSchema = Joi.validate(params, schema);

  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    logger.info(
      `Verify outlet linking with request [${JSON.stringify(
        JSON.stringify(params)
      )}]`
    );
    const otpValidationResponse = await ConsumerService.validateUserOtp(params);
    const verification = await Verification.findOne({
      verificationId: params.verificationId,
    });

    if (!verification) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Outlet verification is not found",
      });
    }

    const ownerId = verification.ownerId;
    const outletUserId = verification.outletUserId;

    const existingOutlet = await Outlet.findOne({
      userId: outletUserId,
      status: OutletStatus.ACTIVE,
    });
    if (existingOutlet) {
      return Promise.resolve({
        statusCode: OK,
        data: existingOutlet,
      });
    }

    const outletUserDetails = await ConsumerService.getUserDetails(
      outletUserId
    );
    const outletUserDetailsData = outletUserDetails.data.data;

    if (
      outletUserDetailsData.store.length < 1 ||
      outletUserDetailsData.store[0].wallet.length < 1
    ) {
      logger.error(
        "Could not verify outlet linking because outlet does not have a wallet"
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Could not verify outlet linking. Please try again",
      });
    }

    const outlet = await saveNewOutletMapping({
      ownerId,
      outletUserId,
      walletId: outletUserDetailsData.store[0].wallet[0].id,
    });

    // DELETE THE VERIFICATION ONCE VERIFICATION IS SUCCESSFUL
    await Verification.findOneAndDelete({ ownerId, outletUserId });
    return Promise.resolve({
      statusCode: OK,
      data: outlet,
    });
  } catch (err) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err.message,
    });
  }
};

const saveOutletWithOwner = async ({ outletUserId, ownerId, walletId }) => {
  // Find owner and check if owner is a PARTNER
  const owner = await Owner.findOne({ userId: ownerId });
  if (!owner) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Owner does not exist. Please sign up.",
    });
  }

  if (owner.userType === UserType.PARTNER) {
    const outletUserDetails = await ConsumerService.getUserDetails(
      outletUserId
    );
    const outletUserDetailsData = outletUserDetails.data.data;
    const walletId = outletUserDetailsData.store[0].wallet[0].id;

    if (
      outletUserDetailsData.store.length < 1 ||
      outletUserDetailsData.store[0].wallet.length < 1
    ) {
      logger.error(
        "Could not verify outlet linking because outlet does not have a wallet"
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Could not verify outlet linking. Please try again",
      });
    }
    const newOutletMapping = new Outlet({
      userId: outletUserId,
      ownerId,
      walletId,
    });
    return newOutletMapping.save();
  }
};

const saveNewOutletMapping = ({ ownerId, outletUserId, walletId }) => {
  const outlet = new Outlet({ ownerId, userId: outletUserId, walletId });
  return outlet.save();
};

export const getOutlets = async ({ ownerId, page, limit }) => {
  try {
    const outlets = await Outlet.paginate(
      {
        ownerId,
      },
      { page, limit, sort: { createdAt: -1 } }
    );

    const outletDetails = await fetchOutletDetails(outlets.docs);

    return Promise.resolve({
      statusCode: OK,
      data: {
        page: outlets.page,
        pages: outlets.pages,
        limit: outlets.limit,
        total: outlets.total,
        list: outletDetails,
      },
    });
  } catch (err) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "An error occurred when retrieving outlets",
    });
  }
};

export const fetchOutletDetails = async (outlets) => {
  let outletDetails = [];
  try {
    await async.forEach(outlets, async (outlet) => {
      const response = await ConsumerService.getUserDetails(outlet.userId);
      const userDetailsData = response.data;

      const wallet = userDetailsData.data.store[0].wallet[0];
      const walletId = wallet.id;

      const walletSummaryResponse = await WalletService.getWalletById(walletId);
      const walletSummaryData = walletSummaryResponse.data;

      userDetailsData.data.store[0].wallet[0] = {
        ...wallet,
        ...walletSummaryData.data,
      };

      outletDetails.push({
        ...userDetailsData.data,
        status: outlet.status,
      });
    });
  } catch (e) {
    logger.error(`::: failed to fetch user details :::`);
  }
  return outletDetails;
};

export const getOutletByUserId = async ({ userId }) => {
  try {
    const outletUserDetailsResponse = await ConsumerService.getUserDetails(
      userId
    );
    const outletUserDetailsData = outletUserDetailsResponse.data;

    return Promise.resolve({
      statusCode: OK,
      data: outletUserDetailsData.data,
    });
  } catch (e) {
    logger.error(
      `Error occurred while fetching outlet details - ${JSON.stringify(e)}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message || "An error occurred when fetching outlet details",
    });
  }
};

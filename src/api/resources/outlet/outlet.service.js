import Joi from "joi";
import async from "async";
import * as AuthService from "../../modules/auth-service.js";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as TransactionService from "../../modules/transaction-service.js";
import * as WalletService from "../../modules/wallet-service";
import { Outlet } from "./outlet.model.js";
import { CommissionBalance } from "../commission/commissionbalance.model.js";
import { Owner } from "../owner/owner.model.js";
import { WithdrawalLevel } from "../commission/commission.type";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import { validatePhone } from "../../modules/util.js";
import { Verification } from "./verification.model.js";
import { Commission } from "../commission/commission.model.js";
import logger from "../../../logger.js";
import { AuthServiceAction, OutletStatus } from "./outlet.status.js";
import { UserRole } from "../owner/user.role";
import { UserType } from "../owner/user.type";

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

    const userDetailsData = userDetails.data;
    const userData = userDetailsData.data;
    const outletUserId = userDetailsData.data.id;
    const walletId = userDetailsData.data.store[0].wallet[0].id;

    logger.info(
      `Retrieving user details from consumer service as ${JSON.stringify(
        userDetails
      )}`
    );

    // check if outlet is already existing.
    const existingOutlet = await Outlet.findOne({
      outletId: outletUserId,
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

    await addCommissionToOwner({
      userDetails,
      outletUserId,
      ownerId,
    });

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
  //        credit partner 0.03% of transaction sum

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
    `Total transaction amount for the first 30 of getting an outlet estimated as ${totalTransactionAmount}`
  );

  const onboardingCommission = await Commission.findOne({
    type: "ONBOARDING",
    owner: ownerId,
  });

  logger.info(`Print onboarding commission as ${onboardingCommission}`);
  if (
    onboardingCommission &&
    totalTransactionAmount >= onboardingCommission.condition
  ) {
    const commissionBalance = await CommissionBalance.findOne({
      owner: ownerId,
      type: "ONBOARDING",
    }).lean();

    if (commissionBalance) {
      commissionBalance.amount =
        commissionBalance.amount +
        onboardingCommission.multiplier * totalTransactionAmount;
      await commissionBalance.save();
    } else {
      const commissionBalance = await CommissionBalance.create({
        amount: onboardingCommission.multiplier * totalTransactionAmount,
        owner: ownerId,
      });
    }
  }

  //    THRIFT_ONBOARDING COMMISSIONS to be calculated when thrift users onboarded data is available
  //   if PARTNER has not been credited with thrift onboarding commission
  //     find thrift users onboarded by user and check if the users meet the contract terms
  //         if met
  //            credit PARTNER with the commission and
  //            set flag that the partner has been credited with thrift-onboarding commission

  //    TRANSACTION COMMISSIONS
  //   Filter transactions for every transfer (type TRANSFER) made by user
  //   that corresponds to settings (set by admin)
  const filteredTransfer = outletTransactionData.filter(
    (transaction) =>
      transaction.type === "Transfer" && transaction.successfulAmount
  );

  //   if transfer exists
  const transferCommission = await Commission.findOne({
    type: "TRANSACTION",
    owner: ownerId,
    transactions: "transfers",
  });

  logger.info(`Get the transfer commission condition as ${transferCommission}`);

  if (filteredTransfer.length > 0) {
    const commissionOnTransfers =
      filteredTransfer.length * transferCommission.multiplier;

    const commissionBalance = await CommissionBalance.findOne({
      owner: ownerId,
      type: "TRANSACTION",
    });

    if (commissionBalance) {
      // credit owner for every transfer
      commissionBalance.amount =
        commissionBalance.amount + commissionOnTransfers;
      await commissionBalance.save();

      logger.info(
        `Show owners commisision balance as ${commissionBalance.amount}`
      );
    } else {
      //  create a commissionBalance with amount === creditAmount
      const creditAmount = new CommissionBalance({
        amount: transferCommission.multiplier * filteredTransfer.length,
        owner: ownerId,
        type: "TRANSACTION",
      });
      await creditAmount.save();
    }
  }

  //   Filter transactions for every transfer (type WITHDRAWAL) made by user
  //   that corresponds to settings (set by admin)
  const filteredTransaction = outletTransactionData.filter(
    (transaction) =>
      transaction.type === "Withdrawal" && transaction.successfulAmount
  );
  //   if TRANSACTION exists
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
      transactions: "withdrawals",
      owner: ownerId,
    }).sort({ withdrawals: 1 });

    let condition1;
    let condition2;
    let condition3;
    let condition4;
    let condition5;
    if (withdrawalCommission[0].withdrawals === "level1") {
      condition1 = withdrawalCommission[0].condition;
    } else if (withdrawalCommission[1].withdrawals === "level2") {
      condition2 = withdrawalCommission[1].condition;
    } else if (withdrawalCommission[2].withdrawals === "level3") {
      condition3 = withdrawalCommission[2].condition;
    } else if (withdrawalCommission[3].withdrawals === "level4") {
      condition4 = withdrawalCommission[3].condition;
    } else if (withdrawalCommission[4].withdrawals === "level5") {
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

    logger.info(`computed ${creditAmount}`);

    const commissionBalance = await CommissionBalance.findOne({
      owner: ownerId,
      type: "TRANSACTION",
    });

    if (commissionBalance) {
      // credit partner for every transfer
      commissionBalance.amount = commissionBalance.amount + creditAmount;
      await commissionBalance.save();
    } else {
      //  create a commissionBalance with amount === creditAmount
      const newCreditAmount = new CommissionBalance({
        amount: creditAmount,
        owner: ownerId,
        type: "TRANSACTION",
      });
      await newCreditAmount.save();
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
  } else {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Outlets cannot be added to owner.",
    });
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
  await async.forEach(outlets, async (outlet) => {
    const response = await ConsumerService.getUserDetails(outlet.userId);
    const userDetailsData = response.data;

    logger.info(
      `Verify outlet linking with request [${JSON.stringify(userDetailsData)}]`
    );

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
  return outletDetails;
};

export const getOutletByOutletId = async ({ outletId }) => {
  try {
    const outletUserDetailsResponse = await ConsumerService.getUserDetails(
      outletId
    );
    const outletUserDetailsData = outletUserDetailsResponse.data;

    const outlet = await Outlet.findOne({ userId: outletId });

    const outletDetailsData = {
      ...outletUserDetailsData.data,
      status: outlet.status,
      walletId: outlet.walletId,
      createdAt: outlet.createdAt,
      updatedAt: outlet.updatedAt,
    };

    return Promise.resolve({
      statusCode: OK,
      data: outletDetailsData,
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

import Joi from "joi";
import async from "async";
import * as AuthService from "../../modules/auth-service.js";
import * as ConsumerService from "../../modules/consumer-service.js";
import * as WalletService from "../../modules/wallet-service";
import { Outlet } from "./outlet.model.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import { validatePhone } from "../../modules/util.js";
import { Verification } from "./verification.model.js";
import logger from "../../../logger.js";
import { AuthServiceAction, OutletStatus } from "./outlet.status.js";

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
    if (existingOutlet) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    logger.info(
      `Sending verification OTP to ${JSON.stringify(params.phoneNumber)}`
    );
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

    const findAndUpdateOutlet = await Outlet.findOneAndUpdate(
      {
        userId: outletUserId,
        ownerId,
      },
      { $set: { status } },
      { new: true }
    );
    const updatedOutlet = findAndUpdateOutlet.exec();

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
      { page, limit }
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
    const outletUserDetails = await ConsumerService.getUserDetails(outletId);
    const outletUserDetailsData = outletUserDetails.data;

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

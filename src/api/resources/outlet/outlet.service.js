import Joi from "joi";
import async from "async";
import * as AuthService from "../../modules/auth-service.js";
import * as ConsumerService from "../../modules/consumer-service.js";
import { Outlet } from "./outlet.model.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import { validatePhone } from "../../modules/util.js";
import { Verification } from "./verification.model.js";
import logger from "../../../logger.js";
import { UserStatus } from "../user/user.type.js";

export const linkOwnerToOutlet = async ({ params, userId }) => {
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

    const outletUserId = loginResponse.data.userId;
    const userDetails = await ConsumerService.getUserDetails(outletUserId);
    const userDetailsData = userDetails.data;
    const outletId = userDetailsData.id;

    const existingOutlet = await Outlet.findOne({ outletId });
    if (existingOutlet) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    logger.info(
      `Sending verification OTP to ${JSON.stringify(params.phoneNumber)}`
    );
    const otpResponseData = await sendVerificationOtp({
      phoneNumber: params.phoneNumber,
    });
    await saveVerification({
      verificationId: otpResponseData.id,
      outletId,
      ownerId: userId,
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
      message:
        JSON.parse(err?.message)?.message ||
        "Could not link outlet. Please try again",
    });
  }
};

export const unlinkOutletFromOwner = async ({ userId, outletId }) => {
  try {
    logger.info(`Outlet owner ${userId} request to unlink outlet ${outletId}`);
    const existingOutlet = await Outlet.findOne({ outletId, ownerId: userId });
    if (!existingOutlet) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet not found. Please supply a valid outlet",
      });
    }
    await Outlet.findOneAndUpdate(
      { outletId, ownerId: userId },
      { $set: { status: UserStatus.INACTIVE } },
      { new: true }
    ).exec();
    return Promise.resolve({
      statusCode: OK,
    });
  } catch (e) {
    logger.error(`Failed to unlink outlet with the following error ${e}`);
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not delete outlet. Try again",
    });
  }
};

export const suspendOutlet = async ({ outletId }) => {
  logger.info(`Outlet owner request to suspend outlet ${outletId}`);
  try {
    // SET THE USER TO INACTIVE ON THE AUTH SERVICE (TO PREVENT ACCESS TO THE APP)
    await AuthService.updateUserStatus({
      userId: outletId,
      status: "INACTIVE",
    });

    // SET USER TO INACTIVE ON CONSUMER SERVICE. UPDATES ONLY THE STATUS OF THE USER ON CONSUMER SERVICE
    const params = { status: "INACTIVE" };
    await ConsumerService.updateUserProfile({ params, userId: outletId });
    return Promise.resolve({
      statusCode: OK,
    });
  } catch (e) {
    logger.error(
      `Failed to suspend outlet ${outletId} with error ${JSON.stringify(e)}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not suspend outlet. Try again",
    });
  }
};

const sendVerificationOtp = async ({ phoneNumber }) => {
  try {
    const params = { phoneNumber, type: "PHONE_NUMBER" };

    logger.info(
      `Request to link outlet with request b [${JSON.stringify(params)}]`
    );
    const otpResponse = await ConsumerService.generateOtp(params);
    return otpResponse.data;
  } catch (err) {
    logger.error("Could not send verification OTP");
    return Promise.reject({
      statusCode: NOT_FOUND,
      message: JSON.stringify({
        message: "Could not send verification OTP",
      }),
    });
  }
};

const saveVerification = async ({
  verificationId,
  outletId,
  ownerId,
  status,
}) => {
  const existingVerification = await Verification.findOne({
    outletId,
    ownerId,
  });

  // UPDATE AN EXISTING VERIFICATION IF IT ALREADY EXISTS
  if (existingVerification) {
    await Verification.findOneAndUpdate(
      { outletId, ownerId },
      { $set: { verificationId } },
      { new: true }
    ).exec();
    return;
  }

  const verification = new Verification({
    verificationId,
    outletId,
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
    const outletId = verification.outletId;

    const existingOutlet = await Outlet.findOne({ outletId });
    if (existingOutlet) {
      return Promise.resolve({
        statusCode: OK,
        data: existingOutlet,
      });
    }

    const outlet = await saveNewOutletMapping({ ownerId, outletId });

    // DELETE THE VERIFICATION ONCE VERIFICATION IS SUCCESSFUL
    await Verification.findOneAndDelete({ ownerId, outletId });
    return Promise.resolve({
      statusCode: OK,
      data: outlet,
    });
  } catch (err) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: JSON.parse(err.message)?.message,
    });
  }
};

const saveNewOutletMapping = ({ ownerId, outletId }) => {
  const outlet = new Outlet({ ownerId, outletId });
  return outlet.save();
};

export const getOutlets = async ({ userId, page, limit }) => {
  try {
    const outlets = await Outlet.paginate(
      { ownerId: userId, status: UserStatus.ACTIVE },
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

const fetchOutletDetails = async (outlets) => {
  let outletDetails = [];
  await async.forEach(outlets, async (outlet, key, cb) => {
    const response = await ConsumerService.getUserDetails(outlet.outletId);
    outletDetails.push(response.data);
  });
  return outletDetails;
};

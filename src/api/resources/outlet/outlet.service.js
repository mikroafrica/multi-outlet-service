import Joi from "joi";
import * as AuthService from "../../modules/auth-service.js";
import * as ConsumerService from "../../modules/consumer-service.js";
import { Outlet } from "./outlet.model.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import { validatePhone } from "../../modules/util.js";
import { Verification } from "./verification.model.js";
import logger from "../../../logger.js";

export const linkOwnerToOutlet = async ({ params, userId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = validateLinkOutletParams(params);

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

  const loginRequest = buildLoginRequest({ phoneNumber, pin: params.pin });
  try {
    const loginResponse = await AuthService.loginWithPhoneNumber(loginRequest);

    const outletUserId = loginResponse.data.userId;
    const userDetails = await ConsumerService.getUserDetails(outletUserId);
    const userDetailsData = userDetails.data;
    const outletId = userDetailsData.id;

    const existingOutlet = await Outlet.findOne({ outletId });
    if (existingOutlet != null) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    const email = userDetailsData.email;
    const otpResponseData = await sendVerificationOtp({
      email,
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
      message: JSON.parse(err.message)?.message,
    });
  }
};

const buildLoginRequest = ({ phoneNumber, pin }) => {
  return {
    username: phoneNumber,
    password: pin,
    role: "outlet",
  };
};

const sendVerificationOtp = async ({ email, phoneNumber }) => {
  const params = { email, phoneNumber };
  const otpResponse = await ConsumerService.generateOtp(params);
  return otpResponse.data;
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
  if (existingVerification != null) {
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
    verificationId: Joi.string().required(),
    otpCode: Joi.string().required(),
  });

  const validateSchema = Joi.validate(params, schema);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  const { verificationId, otpCode } = params;
  try {
    const otpValidationResponse = await ConsumerService.validateUserOtp({
      verificationId,
      otpCode,
    });
    const verification = await Verification.findOne({
      verificationId: params.verificationId,
    });

    if (verification == null) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    const ownerId = verification.ownerId;
    const outletId = verification.outletId;

    const existingOutlet = await Outlet.findOne({ outletId });
    if (existingOutlet != null) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Outlet has been added previously",
      });
    }

    const outlet = await saveNewOutletMapping({ ownerId, outletId });

    // DELETE THE VERIFICATION ONCE VERIFICATION IS SUCCESSFUL
    // await Verification.findOneAndDelete({ ownerId, outletId });
    return Promise.resolve({
      statusCode: OK,
      data: {
        message: "Outlet has been mapped successfully",
        outlet,
      },
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

const validateLinkOutletParams = (params) => {
  const schema = Joi.object().keys({
    phoneNumber: Joi.string().required(),
    pin: Joi.string().required(),
  });

  return Joi.validate(params, schema);
};

export const getOutlets = async ({ userId, page, limit }) => {
  try {
    const outlets = await Outlet.find(
      { ownerId: userId },
      {},
      { skip: page * limit, limit }
    );
    const total = await Outlet.countDocuments({ ownerId: userId }).exec();
    const outletDetails = await fetchOutletDetails(outlets);

    return Promise.resolve({
      statusCode: OK,
      data: {
        page,
        limit,
        total,
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
  const outletDetailsPromise = [];
  for (let outlet of outlets) {
    outletDetailsPromise.push(ConsumerService.getUserDetails(outlet.outletId));
  }
  const outletDetailsResponse = await Promise.all(outletDetailsPromise);
  const outletDetails = [];
  for (let outletDetail of outletDetailsResponse) {
    outletDetails.push(outletDetail.data);
  }
  return outletDetails;
};

import * as TransactionService from "../../modules/transaction-service";
import * as ConsumerService from "../../modules/consumer-service";
import * as PaymentService from "../../modules/payment-service";
import { BAD_REQUEST, OK } from "../../modules/status";
import Joi from "joi";
import logger from "../../../logger";
import { Owner } from "../owner/owner.model";
import { Outlet } from "../outlet/outlet.model";
import { v4 as uuidv4 } from "uuid";

export const transfer = async ({ ownerId, outletId, params, destination }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Request body is required",
    });
  }

  const schema = Joi.object().keys({
    amount: Joi.number().required(),
    accountNumber: Joi.string(),
    bankCode: Joi.string(),
    productCategory: Joi.string(),
    recipientBank: Joi.string(),
    recipientName: Joi.string(),
    recipientAccountNumber: Joi.string(),
    serviceFee: Joi.string(),
  });

  const validateSchema = Joi.validate(params, schema);

  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    destination = destination.toLowerCase();
    if (
      destination !== "owner" &&
      destination !== "outlet" &&
      destination !== "bank"
    ) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Please supply a valid destination",
      });
    }

    // 0268886f-cd69-4b02-9e9d-a4e2efbb70bc

    const owner = await Owner.findOne({ userId: ownerId });
    const outlet = await Outlet.findOne({ userId: outletId });

    const ownerDetails = await ConsumerService.getUserDetails(ownerId);
    const ownerDetailsData = ownerDetails.data.data;

    const outletDetails = await ConsumerService.getUserDetails(outletId);
    const outletDetailsData = outletDetails.data.data;

    if (destination === "owner") {
      params.userWalletId = outlet.walletId;
      params.userId = outletId;
      params.recipientId = ownerId;
      params.customerBillerId = owner.walletId;
      params.sourceName = `${outletDetailsData.businessName}`;

      params.recipientPhoneNumber = ownerDetailsData.phoneNumber;
      params.recipientName = `${ownerDetailsData.firstName} ${ownerDetailsData.lastName}`;
      params.transactionType = "P2P";
      params.destinationFcmToken = "";
    } else if (destination === "outlet") {
      params.userWalletId = owner.walletId;
      params.userId = ownerId;
      params.recipientId = outletId;
      params.customerBillerId = outlet.walletId;

      params.sourceName = `${ownerDetailsData.firstName} ${ownerDetailsData.lastName}`;

      params.recipientPhoneNumber = outletDetailsData.phoneNumber;
      params.recipientName = `${outletDetailsData.firstName} ${outletDetailsData.lastName}`;
      params.transactionType = "P2P";
      params.destinationFcmToken = outletDetailsData.fcmToken;
    } else if (destination === "bank") {
      params.product = "OTHERS";
      params.customerBillerId = params.accountNumber;
      params.recipientAddress = "";
      params.recipientPhoneNumber = "";
      params.userId = ownerId;
      params.agentFee = 0;
      params.transactionType = "TRANSFER";
      params.userWalletId = owner.walletId;
      params.userName = `${ownerDetailsData.firstName} ${ownerDetailsData.lastName}`;
      params.fcmToken = ownerDetailsData.fcmToken;
      params.userPhoneNumber = owner.phoneNumber;
      params.recipientRemarks = "remarks";
    }

    const uuid = uuidv4();
    params = {
      ...params,
      uniqueIdentifier: uuid,
    };

    logger.info(
      `Transfer to ${destination} wallet request body ${JSON.stringify(params)}`
    );

    const response = await TransactionService.creteTransaction(params);
    const responseData = response.data;

    return Promise.resolve({
      statusCode: OK,
      data: responseData.data,
    });
  } catch (e) {
    logger.error(`Error during transfer ${JSON.stringify(e)}`);
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message || "Could not transfer to outlet owner's wallet",
    });
  }
};

export const validateAccountNumber = async ({ params }) => {
  return PaymentService.accountNumberLookUp(params)
    .then((responseData) => {
      const response = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: response.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while validating account number ${JSON.stringify(err)}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

export const getServiceFee = async ({ params, type }) => {
  return TransactionService.fetchServiceFee(params, type)
    .then((responseData) => {
      const response = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: response.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while fetching service fee ${JSON.stringify(err)}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

export const fetchBanks = () => {
  return PaymentService.banks()
    .then((responseData) => {
      const bankResponse = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: bankResponse.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while fetching banks with error ${JSON.stringify(err)}`
      );
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

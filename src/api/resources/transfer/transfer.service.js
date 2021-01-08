import * as TransactionService from "../../modules/transaction-service";
import * as ConsumerService from "../../modules/consumer-service";
import { BAD_REQUEST, OK } from "../../modules/status";
import Joi from "joi";
import logger from "../../../logger";
import { Owner } from "../owner/owner.model";
import { Outlet } from "../outlet/outlet.model";
import { v4 as uuidv4 } from "uuid";

export const walletTransfer = async ({
  ownerId,
  outletId,
  params,
  destination,
}) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Request body is required",
    });
  }

  const schema = Joi.object().keys({
    amount: Joi.number().required(),
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
    if (destination !== "owner" && destination !== "outlet") {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Please supply a valid destination",
      });
    }

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
      params.recipientName = `Admin`;
      params.destinationFcmToken = "";
    } else if (destination === "outlet") {
      params.userWalletId = owner.walletId;
      params.userId = ownerId;
      params.recipientId = outletId;
      params.customerBillerId = outlet.walletId;

      params.sourceName = `Admin`;

      params.recipientPhoneNumber = outletDetailsData.phoneNumber;
      params.recipientName = `${outletDetailsData.businessName}`;
      params.destinationFcmToken = outletDetailsData.fcmToken;
    }

    const uuid = uuidv4();
    params = {
      ...params,
      transactionType: "P2P",
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
    logger.error(`Error during transfer to outlet owner ${JSON.stringify(e)}`);
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message || "Could not transfer to outlet owner's wallet",
    });
  }
};

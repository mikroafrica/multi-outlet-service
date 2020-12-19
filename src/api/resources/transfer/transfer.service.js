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

    if (destination === "owner") {
      const outlet = await Outlet.findOne({ userId: outletId });
      params.userWalletId = outlet.walletId;
      params.recipientId = ownerId;

      const ownerDetails = await ConsumerService.getUserDetails(ownerId);
      const ownerDetailsData = ownerDetails.data.data;
      params.sourceName = ownerDetailsData.businessName;
    } else if (destination === "outlet") {
      const owner = await Owner.findOne({ userId: ownerId });
      params.userWalletId = owner.walletId;
      params.recipientId = outletId;

      const outletDetails = await ConsumerService.getUserDetails(outletId);
      const outletDetailsData = outletDetails.data.data;
      params.sourceName = outletDetailsData.businessName;
    }

    params = {
      ...params,
      transactionType: "P2P",
      uniqueIdentifier: uuidv4(),
    };

    logger.info(
      `Transfer to outlet owner wallet request body ${JSON.stringify(params)}`
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

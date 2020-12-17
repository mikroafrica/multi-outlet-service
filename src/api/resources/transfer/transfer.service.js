import * as WalletService from "../../modules/wallet-service";
import { BAD_REQUEST, OK } from "../../modules/status";
import Joi from "joi";
import logger from "../../../logger";
import { Owner } from "../owner/owner.model";
import { Outlet } from "../outlet/outlet.model";

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
    const owner = await Owner.findOne({ userId: ownerId });
    const outlet = await Outlet.findOne({ userId: outletId });

    destination = destination.toLowerCase();
    if (destination !== "owner" && destination !== "outlet") {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Please supply a valid destination",
      });
    }

    if (destination === "owner") {
      params.destinationWalletId = owner.walletId;
      params.sourceWalletId = outlet.walletId;
    } else if (destination === "outlet") {
      params.destinationWalletId = outlet.walletId;
      params.sourceWalletId = owner.walletId;
    }

    params = {
      ...params,
      reference: `TRF from ${params.sourceWalletId} to ${
        params.destinationWalletId
      } - ${Date.now()}`,
    };

    logger.info(
      `Transfer to outlet owner wallet request body ${JSON.stringify(params)}`
    );

    const response = await WalletService.createWalletTransaction(params);
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

// export const transferToOutletWallet = async ({ ownerId, outletId, params }) => {
//   if (!params) {
//     return Promise.reject({
//       statusCode: BAD_REQUEST,
//       message: "Request body is required",
//     });
//   }
//
//   const schema = Joi.object().keys({
//     amount: Joi.number().required(),
//   });
//
//   const validateSchema = Joi.validate(params, schema);
//
//   if (validateSchema.error) {
//     return Promise.reject({
//       statusCode: BAD_REQUEST,
//       message: validateSchema.error.details[0].message,
//     });
//   }
//
//   try {
//     const outlet = await Outlet.findOne({ userId: outletId });
//     const owner = await Owner.findOne({ userId: ownerId });
//     params = {
//       ...params,
//       destinationWalletId: outlet.walletId,
//       sourceWalletId: owner.walletId,
//       reference: Date.now(),
//     };
//
//     logger.info(
//       `Transfer to outlet owner wallet request body ${JSON.stringify(params)}`
//     );
//
//     const response = await WalletService.createWalletTransaction(params);
//     return Promise.resolve({
//       statusCode: OK,
//       data: response.data,
//     });
//   } catch (e) {
//     logger.error(`Error during transfer to outlet owner ${JSON.stringify(e)}`);
//     return Promise.reject({
//       statusCode: BAD_REQUEST,
//       message: e.message || "Could not transfer to outlet owner's wallet",
//     });
//   }
// };

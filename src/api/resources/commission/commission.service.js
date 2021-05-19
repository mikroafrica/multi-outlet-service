import { BAD_REQUEST, OK } from "../../modules/status";
import Joi from "joi";
import {
  CommissionType,
  TransactionType,
  WithdrawalLevel,
} from "./commission.type";
import { Commission } from "./commission.model";
import logger from "../../../logger";
import { Owner } from "../owner/owner.model";
import { Approval } from "../owner/user.type";
import { CommissionBalance } from "./commissionbalance.model";

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

    logger.info(
      `Get existing partner commission settings as  ${JSON.stringify(
        existingCommissionSettings
      )}`
    );

    if (existingCommissionSettings) {
      const updatedCommission = await Commission.findOneAndUpdate(
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
      return updatedCommission;
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
    const partner = await Owner.findOne({ userId });
    let returnedApprovalStatus;
    if (partner.approval === Approval.APPROVED) {
      returnedApprovalStatus = Approval.APPROVED;
    } else {
      const partnerCommission = await Commission.find({ owner: userId });

      if (partnerCommission && partnerCommission.length > 0) {
        partner.approval = Approval.APPROVED;
        await partner.save();
        returnedApprovalStatus = Approval.APPROVED;
      } else {
        returnedApprovalStatus = Approval.PENDING;
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

export const getPartnerCommissionBalance = async ({ userId }) => {
  try {
    // const commissionType = CommissionType[commissiontype];
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
      message: "Could not fetch commission balance for partner.",
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

    logger.info(
      `Show updated comiision as  ${JSON.stringify(updatedCommission)}`
    );

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

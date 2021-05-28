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
import { Approval, UserType } from "../owner/user.type";
import { CommissionBalance } from "./commissionbalance.model";

export const createCommission = async ({ params, ownerId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = validateCommissionSchema(params);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const withdrawalLevel = WithdrawalLevel[params.withdrawalLevel];
    const commissionType = CommissionType[params.commissionType];
    if (!commissionType) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Please supply a valid commission type.",
      });
    }

    //update commission setting if already existing
    const existingCommissionSettings = await Commission.findOne({
      $or: [
        {
          $and: [
            { owner: ownerId },
            { type: commissionType },
            { level: withdrawalLevel },
          ],
        },
        {
          $and: [{ owner: ownerId }, { type: commissionType }, { level: null }],
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
                { owner: ownerId },
                { type: commissionType },
                { level: withdrawalLevel },
              ],
            },
            {
              $and: [
                { owner: ownerId },
                { type: commissionType },
                { level: null },
              ],
            },
          ],
        },
        {
          $set: { condition: params.condition, multiplier: params.multiplier },
        },
        { new: true }
      );
      return Promise.resolve({
        statusCode: OK,
        data: updatedCommission,
      });
    }

    const saveNewCommission = new Commission({
      condition: params.condition,
      multiplier: params.multiplier,
      owner: ownerId,
      type: commissionType,
      level: withdrawalLevel,
    });

    await saveNewCommission.save();

    logger.info(`Commission created as ${saveNewCommission}`);

    return Promise.resolve({
      statusCode: OK,
      data: saveNewCommission,
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

export const getOwnerApprovalStatus = async ({ userId }) => {
  try {
    // check for owner approval status if commissions has been set for the owner
    const owner = await Owner.findOne({ userId });
    console.log("owner", owner);
    if (!owner) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Owner could not be found.",
      });
    }
    let returnedApprovalStatus;
    if (owner.approval === Approval.APPROVED) {
      returnedApprovalStatus = Approval.APPROVED;
    } else {
      const ownerCommission = await Commission.find({ owner: userId });
      if (ownerCommission && ownerCommission.length > 0) {
        owner.approval = Approval.APPROVED;
        await owner.save();
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

export const getOwnerCommissionBalance = async ({ userId }) => {
  try {
    // check for if the partner has commissions already set
    const ownerCommission = await CommissionBalance.find({ owner: userId });
    if (!ownerCommission) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Commission not set for partner",
      });
    }

    return Promise.resolve({
      statusCode: OK,
      data: ownerCommission,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not fetch commission balance for partner.",
    });
  }
};

export const getOwnerCommissionSettings = async ({ ownerId }) => {
  try {
    const commissionSettings = await Commission.find({ owner: ownerId });
    if (!commissionSettings) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Commission rule not yet set for owner.",
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

export const updateOwnerCommissionSettings = async ({
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

    logger.info(`Owner updated comiision ${JSON.stringify(updatedCommission)}`);

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

const validateCommissionSchema = ({ params }) => {
  const schema = Joi.object()
    .keys({
      condition: Joi.number().required(),
      multiplier: Joi.number().required(),
      commissionType: Joi.string()
        .valid([
          CommissionType.ONBOARDING,
          CommissionType.TRANSFER,
          CommissionType.WITHDRAWAL,
        ])
        .required(),
      withdrawalLevel: Joi.string()
        .valid([
          WithdrawalLevel.LEVEL_ONE,
          WithdrawalLevel.LEVEL_TWO,
          WithdrawalLevel.LEVEL_THREE,
          WithdrawalLevel.LEVEL_FOUR,
          WithdrawalLevel.LEVEL_FIVE,
        ])
        .optional(),
    })
    .unknown(true);

  return Joi.validate(params, schema);
};

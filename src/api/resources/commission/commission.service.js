import { BAD_REQUEST, OK } from "../../modules/status";
import Joi from "joi";
import { Type, Level } from "./commission.type";
import { Commission } from "./commission.model";
import logger from "../../../logger";
import { Owner } from "../owner/owner.model";
import { Approval } from "../owner/user.type";
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
    const level = Level[params.level];
    const type = Type[params.type];

    if (!type) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Please supply a valid commission type.",
      });
    }

    //update commission setting if already existing
    const existingCommissionSettings = await Commission.findOne({
      $or: [
        {
          $and: [{ owner: ownerId }, { type }, { level }],
        },
        {
          $and: [{ owner: ownerId }, { type }, { level: null }],
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
              $and: [{ owner: ownerId }, { type }, { level }],
            },
            {
              $and: [{ owner: ownerId }, { type }, { level: null }],
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
      type,
      level,
    });

    await saveNewCommission.save();

    logger.info(`Commission created as ${saveNewCommission}`);

    // Find owner and set approval status to APPROVED since commission has been set for the owner
    const owner = await Owner.findOne({ userId: ownerId });
    if (owner.approval === Approval.PENDING) {
      owner.approval = Approval.APPROVED;
      await owner.save();
    }

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
      type: Joi.string()
        .valid([Type.ONBOARDING, Type.TRANSFER, Type.WITHDRAWAL])
        .required(),
      level: Joi.string()
        .valid([
          Level.LEVEL_ONE,
          Level.LEVEL_TWO,
          Level.LEVEL_THREE,
          Level.LEVEL_FOUR,
          Level.LEVEL_FIVE,
        ])
        .optional(),
    })
    .unknown(true);

  return Joi.validate(params, schema);
};

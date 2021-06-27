import { BAD_REQUEST, CONFLICT, NOT_FOUND, OK } from "../../modules/status";
import Joi from "joi";
import {
  Commission,
  CommissionCategory,
  FeeType,
  RangeType,
} from "./commission.model";
import logger from "../../../logger";
import { Owner } from "../owner/owner.model";
import { OwnerCommission } from "./owner.commission.model";
import { CommissionStatus } from "../owner/user.type";

const schemaValidation = Joi.object().keys({
  name: Joi.string().required(),
  category: Joi.string().valid(Object.keys(CommissionCategory)).required(),
  rangeType: Joi.string().valid(Object.keys(RangeType)).required(),
  rangeList: Joi.when("rangeType", {
    is: Joi.exist().valid(RangeType.RANGE),
    then: Joi.array()
      .items({
        serviceFee: Joi.number().required(),
        feeType: Joi.string().valid(Object.keys(FeeType)).required(),
        rangeAmount: Joi.object()
          .keys({
            from: Joi.number().required(),
            to: Joi.number().required(),
          })
          .required(),
      })
      .required(),
  }),
  serviceFee: Joi.when("range", {
    is: Joi.exist().valid(RangeType.NON_RANGE),
    then: Joi.number().required(),
    otherwise: Joi.number().allow(null, ""),
  }),

  feeType: Joi.when("serviceFee", {
    is: Joi.exist(),
    then: Joi.string().valid(Object.keys(FeeType)).required(),
    otherwise: Joi.string().allow(null, ""),
  }),
});

export const create = async ({ params }) => {
  logger.info(
    `:::: create commission with request [${JSON.stringify(params)}] ::::`
  );
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = Joi.validate(params, schemaValidation);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const existingCommission = await Commission.findOne({
      name: params.name.toLocaleLowerCase(),
    });
    if (existingCommission) {
      logger.error(
        `::: commission with name [${params.name}] already exist :::`
      );
      return Promise.reject({
        statusCode: CONFLICT,
        message: `commission with name [${params.name}] already exist`,
      });
    }
    const createdCommission = await Commission.create(params);
    logger.info(
      `::: commission created with response [${JSON.stringify(
        createdCommission
      )}] :::`
    );
    return Promise.resolve({
      statusCode: OK,
      data: createdCommission,
    });
  } catch (err) {
    console.error(err);
    logger.error(
      `::: Failed to commission with error [${JSON.stringify(err)}] :::`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to create commission",
    });
  }
};

export const getAllCommissions = async () => {
  try {
    const existingCommission = await Commission.find();
    return Promise.resolve({
      statusCode: OK,
      data: existingCommission,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to fetch resource. Kindly try again",
    });
  }
};

export const update = async ({ params, id }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const validateSchema = Joi.validate(params, schemaValidation);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const existingCommission = await Commission.findOne({ _id: id });
    if (!existingCommission) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Failed to fetch resource. Kindly try again",
      });
    }

    const updatedCommission = await Commission.findOneAndUpdate(
      { _id: id },
      { $set: params },
      { new: true }
    ).exec();

    return Promise.resolve({
      statusCode: OK,
      data: updatedCommission,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to fetch resource. Kindly try again",
    });
  }
};

export const createOwnersCommission = async ({ params, ownerId }) => {
  logger.info(`::: Request param for commission creation is [${params}] :::`);
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schemaValidation = Joi.array()
    .min(3)
    .unique((a, b) => a === b)
    .items(Joi.string().required())
    .required();
  const validateSchema = Joi.validate(params, schemaValidation);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }
  try {
    const existingOwner = await Owner.findOne({ _id: ownerId });
    if (!existingOwner) {
      logger.error(`::: Owner is not found with id [${ownerId}] :::`);
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: `Owner is not found with id [${ownerId}]`,
      });
    }

    // check commission exist and ensure only type of commission is assigned to owners account
    const commissions = [];
    for (let i = 0; i < params.length; i++) {
      const commissionId = params[i];
      const [existingCommission, existingOwnerCommission] = await Promise.all([
        Commission.findOne({ _id: commissionId }),
        OwnerCommission.findOne({ commissionId, ownerId }),
      ]);
      if (!existingCommission) {
        logger.error(
          `::: Commission is not found with id [${commissionId}] :::`
        );
        return Promise.reject({
          statusCode: NOT_FOUND,
          message: `Commission is not found with id [${commissionId}]`,
        });
      }

      if (existingOwnerCommission) {
        logger.error(
          `::: Commission with name [${existingCommission.name}] already exist :::`
        );
        return Promise.reject({
          statusCode: CONFLICT,
          message: `Commission with name [${existingCommission.name}] already exist`,
        });
      }

      commissions.push({
        ownerId,
        commissionId,
        name: existingCommission.name,
        userType: existingOwner.userType,
        category: existingCommission.category,
      });
    }

    const ownersCommission = await OwnerCommission.insertMany(commissions);
    const owner = await Owner.findOneAndUpdate(
      {
        _id: ownerId,
      },
      { $set: { commissionStatus: CommissionStatus.ACTIVE } },
      { new: true }
    ).exec();
    logger.info(
      `::: owner commission status updated with response owner [${JSON.stringify(
        owner
      )}] :::`
    );

    return Promise.resolve({
      statusCode: OK,
      data: ownersCommission,
    });
  } catch (err) {
    console.error(err);
    logger.error(
      `::: Failed to owner's commission with error [${JSON.stringify(err)}] :::`
    );

    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to create owners commission",
    });
  }
};

export const deleteAssignedCommission = async (id: string) => {
  try {
    const response = await OwnerCommission.deleteOne({ _id: id });
    logger.log(
      `::: Commission deleted successfully with id [${id}] and response [${JSON.stringify(
        response
      )}]:::`
    );
    return Promise.resolve({
      statusCode: OK,
      data: "Deleted commission successfully",
    });
  } catch (e) {
    logger.error(`::: Failed to delete commission with id [${id}] :::`);
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to create owners commission",
    });
  }
};

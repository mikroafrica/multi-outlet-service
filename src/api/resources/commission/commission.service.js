import { BAD_REQUEST, CONFLICT, NOT_FOUND, OK } from "../../modules/status";
import Joi from "joi";
import {
  Commission,
  CommissionCategory,
  FeeType,
  RangeType,
} from "./commission.model";
import logger from "../../../logger";

export const create = async ({ params }) => {
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

export const get = async () => {
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

export const put = async ({ params, id }) => {
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
    otherwise: Joi.string().allow(null, ""),
  }),

  feeType: Joi.when("serviceFee", {
    is: Joi.exist(),
    then: Joi.string().valid(Object.keys(FeeType)).required(),
    otherwise: Joi.string().allow(null, ""),
  }),
});

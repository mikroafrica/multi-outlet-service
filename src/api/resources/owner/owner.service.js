import Joi from "joi";
import * as ConsumerService from "../../modules/consumer-service.js";
import { getUsersByReferral } from "../../modules/consumer-service.js";
import { getTickets } from "../../modules/internal-tool-service.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";
import logger from "../../../logger.js";
import { Owner } from "./owner.model";
import { CommissionStatus, UserType } from "./user.type";
import { Outlet } from "../outlet/outlet.model";
import { fetchOutletDetails } from "../outlet/outlet.service";
import async from "async";
import { OwnerCommission } from "../commission/owner.commission.model";
import { generateReferralCode } from "../../modules/consumer-service";

export const getUser = async ({ ownerId }) => {
  try {
    const userDetails = await ConsumerService.getUserDetails(ownerId);
    const userDetailsData = userDetails.data;

    return Promise.resolve({
      statusCode: OK,
      data: userDetailsData.data,
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not fetch owner details. Please try again",
    });
  }
};

export const updateUser = async ({ params, ownerId }) => {
  if (!params) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "request body is required",
    });
  }

  const schema = Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      gender: Joi.string(),
      profileImageId: Joi.string(),
    })
    .unknown(true);

  const validateSchema = Joi.validate(params, schema);
  if (validateSchema.error) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: validateSchema.error.details[0].message,
    });
  }

  try {
    const userDetails = await ConsumerService.getUserDetails(ownerId);
    const userDetailsData = userDetails.data;
    const isBvnVerified = userDetailsData.data.bvnVerified;

    // PREVENT A USER FROM UPDATING THEIR NAME, PHONE NUMBER OR DOB IF BVN IS VERIFIED
    if (isBvnVerified) {
      delete params.firstName;
      delete params.lastName;
      delete params.dob;
      delete params.phoneNumber;
    }

    logger.info(
      `Request body to update user ${ownerId} - ${JSON.stringify(params)}`
    );
    try {
      const updateUserResponse = await ConsumerService.updateUserProfile({
        params,
        userId: ownerId,
      });
      const responseData = updateUserResponse.data;
      const owner = await Owner.findOne({ userId: ownerId });

      return Promise.resolve({
        statusCode: OK,
        data: {
          ...responseData.data,
          phoneNumber: owner ? owner.phoneNumber : "",
        },
      });
    } catch (e) {
      logger.error(
        `An error occurred while updating user with error ${JSON.stringify(e)}`
      );
      return Promise.reject({
        statusCode: e.statusCode,
        message:
          e.message || "Could not update owner profile. Please try again",
      });
    }
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not update owner profile. Please try again",
    });
  }
};

/**
 * this is mostly used by outlet owners and not partners
 * @param usertype
 * @param page
 * @param limit
 * @returns {Promise<{data: {total: *, page: *, list: *}, statusCode: number}>}
 */
export const getUsers = async ({ usertype, page, limit }) => {
  try {
    const userType = UserType[usertype];

    if (!userType) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Invalid user type supplied. Please supply a valid user type",
      });
    }

    let filter = { userType };

    const owners = await Owner.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    const outletDetails = await fetchOutletDetails(owners.docs);

    let ownerDetails = [];
    let users = owners.docs;
    for (let i = 0; i < outletDetails.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (users[i].userId === outletDetails[j].id) {
          const user = users[i];
          const firstName = outletDetails[j].firstName;
          const lastName = outletDetails[j].lastName;
          const email = outletDetails[j].email;
          const businessType = outletDetails[j].businessType;
          const {
            id: ownerId,
            phoneNumber,
            createdAt,
            updatedAt,
            commissionStatus = CommissionStatus.NONE,
          } = user;
          const details = {
            ownerId,
            phoneNumber,
            createdAt,
            updatedAt,
            firstName,
            lastName,
            email,
            commissionStatus,
            businessType,
          };
          ownerDetails.push(details);
        }
      }
    }

    return Promise.resolve({
      statusCode: OK,
      data: {
        page: owners.page,
        total: owners.total,
        list: ownerDetails,
      },
    });
  } catch (e) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Could not fetch users by type. Please try again",
    });
  }
};

export const getOwnerWithOutlets = async ({ ownerId, page, limit }) => {
  try {
    const existingOwner = await Owner.findOne({ _id: ownerId });
    if (!existingOwner) {
      logger.error(`::: Owner with id [${ownerId}] is not found :::`);
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Owner is not found",
      });
    }
    const [userDetailsResponse, outlets, commissions] = await Promise.all([
      ConsumerService.getUserDetails(existingOwner.userId),
      Outlet.paginate(
        { ownerId },
        { page, limit, sort: { createdAt: -1 } }
      ).then((outlets) => fetchOutletDetails(outlets.docs)),
      OwnerCommission.find({ ownerId }),
    ]);
    const userData = userDetailsResponse.data;
    const details = userData.data;

    const userList = outlets.map((user) => {
      const { firstName, lastName, email, phoneNumber, status, id } = user;
      const terminalId =
        Array.isArray(user.store) && user.store.length > 0
          ? user.store[0].terminalId
          : null;
      const isTerminalMapped = !!terminalId;
      return {
        id,
        email,
        status,
        phoneNumber,
        isTerminalMapped,
        name: `${firstName} ${lastName}`,
      };
    });

    const ownerDetails = {
      userType: details.userType,
      approval: details.approval,
      phoneNumber: details.phoneNumber,
      firstName: details.firstName,
      lastName: details.lastName,
      dateOfBirth: details.dateOfBirth,
      businessName: details.businessName,
      businessType: details.businessType,
      email: details.email,
    };

    return Promise.resolve({
      statusCode: OK,
      data: {
        userList,
        info: ownerDetails,
        page: outlets.page,
        total: outlets.total,
        commissions,
      },
    });
  } catch (e) {
    logger.error(
      `::: failed to fetch owners with outlets with error [${JSON.stringify(
        e
      )}] ::: `
    );
    return Promise.reject({
      statusCode: NOT_FOUND,
      message: "Could not fetch partner",
    });
  }
};

export const getUserTickets = async ({
  userId,
  page,
  limit,
  dateTo,
  dateFrom,
  status,
  category,
}) => {
  try {
    const existingOwner = await Owner.findOne({ userId });
    if (!existingOwner) {
      logger.error(`::: Owner with user id [${userId}] is not found :::`);
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Owner is not found",
      });
    }

    const ownerId = existingOwner.id;
    const userIdsList = await getUserIdsUnderOwnerById({ ownerId });
    if (userIdsList.length === 0) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "There are no users under your account yet.",
      });
    }

    const ticketResponse = await getTickets({
      dateTo,
      dateFrom,
      userIdsList,
      limit,
      page,
      status,
      category,
    });

    const ticketResponseData = ticketResponse.data;
    const ticketList = ticketResponseData.data;
    return Promise.resolve({
      statusCode: OK,
      data: ticketList,
    });
  } catch (e) {
    logger.error(
      `::: failed to fetch tickets for users under a owner [${userId}] with error [${JSON.stringify(
        e
      )}] ::: `
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message,
    });
  }
};

export const generateReferralCodeByOwner = async ({
  userId,
  numberOfCodeGen,
}) => {
  try {
    const existingOwner = await Owner.findOne({ userId });
    if (!existingOwner) {
      logger.error(`::: Owner with user id [${userId}] is not found :::`);
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Owner is not found",
      });
    }

    if (existingOwner.userType !== UserType.PARTNER) {
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: `User type with [${existingOwner.userType}] not supported to generate referral code`,
      });
    }

    const accessCode = existingOwner.referralAccessCode;
    const referralGeneration = await generateReferralCode({
      accessCode,
      numberOfCodeGen,
    });

    const referralAccessResponse = referralGeneration.data;
    const referralData = referralAccessResponse.data;
    return Promise.resolve({
      statusCode: OK,
      data: referralData,
    });
  } catch (e) {
    logger.error(
      `::: Failed to generate access code for user id [${userId}] with error [${JSON.stringify(
        e
      )}] :::`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to generate referral code",
    });
  }
};

export const getAllReferredUsers = async ({
  userId,
  dateTo,
  dateFrom,
  mapped,
  status,
  page,
  limit,
  phoneNumber,
}) => {
  try {
    const existingOwner = await Owner.findOne({ userId });
    if (!existingOwner) {
      logger.error(`::: Owner with user id [${userId}] is not found :::`);
      return Promise.reject({
        statusCode: NOT_FOUND,
        message: "Owner is not found",
      });
    }

    const referredUsersResponse = await getUsersByReferral({
      dateTo,
      dateFrom,
      mapped,
      status,
      page,
      limit,
      phoneNumber,
      referralId: existingOwner.referralId,
    });
    const referredData = referredUsersResponse.data;
    const referrals = referredData.data;
    return Promise.resolve({
      statusCode: OK,
      data: referrals,
    });
  } catch (e) {
    logger.error(
      `::: Failed to generate access code for user id [${userId}] with error [${JSON.stringify(
        e
      )}] :::`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Failed to generate referral code",
    });
  }
};

/**
 * get all the userids under an owner id
 * @param ownerId
 * @returns {Promise<*>}
 */
export const getUserIdsUnderOwnerById = async ({ ownerId }) => {
  const outlets = await Outlet.find({ ownerId });
  return outlets.map(function (outlet) {
    return outlet.userId;
  });
};

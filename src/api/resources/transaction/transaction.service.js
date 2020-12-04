import { BAD_REQUEST, OK } from "../../modules/status.js";
import * as TransactionService from "../../modules/transaction-service.js";
import logger from "../../../logger.js";

export const fetchUserTransactions = async ({
  userId,
  type,
  status,
  page,
  limit,
  dateFrom,
  dateTo,
  customerBillerId,
}) => {
  if (!userId) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "User Id is required",
    });
  }

  try {
    const responseData = await TransactionService.fetchTransactions({
      userId,
      dateFrom,
      dateTo,
      page,
      limit,
      status,
      type,
      customerBillerId,
    });
    const transactionData = responseData.data;
    return Promise.resolve({
      statusCode: OK,
      data: transactionData,
    });
  } catch (e) {
    logger.error(
      `Error occurred while fetching transaction by user id ${userId} with error ${JSON.stringify(
        e
      )}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message || "Something went wrong. Please try again",
    });
  }
};

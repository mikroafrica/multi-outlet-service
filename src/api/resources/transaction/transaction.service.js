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

  const params = {
    userId,
    dateFrom,
    dateTo,
    page,
    limit,
    status,
    type,
    customerBillerId,
  };

  logger.info(
    `Fetch transactions by user request body ${JSON.stringify(params)}`
  );

  return TransactionService.fetchTransactions(params)
    .then((responseData) => {
      const transactionData = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: transactionData.data,
      });
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching transaction by user id ${userId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: e.message || "Something went wrong. Please try again",
      });
    });
};

export const getTransactionsCategorySummary = async ({
  userId,
  dateFrom,
  dateTo,
}) => {
  if (!userId) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "User Id is required",
    });
  }

  const params = {
    userId,
    dateFrom,
    dateTo,
  };

  logger.info(
    `Fetch transactions by user request body ${JSON.stringify(params)}`
  );

  return TransactionService.fetchTransactionsCategorySummary(params)
    .then((responseData) => {
      const transactionData = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: transactionData.data,
      });
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching transaction category for user id ${userId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: e.message || "Something went wrong. Please try again",
      });
    });
};

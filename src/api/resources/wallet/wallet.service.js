import {
  fetchWalletSummaryById,
  fetchWalletTransactions,
} from "../../modules/wallet-service.js";
import logger from "../../../logger.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../../modules/status.js";

export const walletTransactionsById = async ({
  walletId,
  dateFrom,
  dateTo,
  page,
  limit,
  transactionType,
}) => {
  return fetchWalletTransactions({
    walletId,
    page,
    limit,
    dateFrom,
    dateTo,
    transactionType,
  })
    .then((responseData) => {
      const walletTransactions = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: walletTransactions,
      });
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching wallet by id ${walletId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message:
          JSON.parse(e.message).message ||
          "Something went wrong. Please try again",
      });
    });
};

export const walletSummaryById = async ({ walletId }) => {
  return fetchWalletSummaryById(walletId)
    .then((responseData) => {
      const walletSummary = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: walletSummary,
      });
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching wallet summary by id ${walletId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message:
          JSON.parse(e.message).message ||
          "Something went wrong. Please try again",
      });
    });
};

import {
  fetchWalletSummaryById,
  fetchWalletTransactions,
} from "../../modules/wallet-service.js";
import logger from "../../../logger.js";
import { NOT_FOUND, OK } from "../../modules/status.js";

export const walletTransactionsById = async ({
  walletId,
  dateFrom,
  dateTo,
  page,
  limit,
  transactionType,
}) => {
  try {
    const responseData = await fetchWalletTransactions({
      walletId,
      page,
      limit,
      dateFrom,
      dateTo,
      transactionType,
    });
    const walletTransactions = responseData.data;
    return Promise.resolve({
      statusCode: OK,
      data: walletTransactions,
    });
  } catch (e) {
    logger.error(
      `Error occurred while fetching wallet by id ${walletId} with error ${JSON.stringify(
        e
      )}`
    );
    return Promise.reject({
      statusCode: NOT_FOUND,
      message: e.message || "Something went wrong. Please try again",
    });
  }
};

export const walletSummaryById = async ({ walletId }) => {
  try {
    const responseData = await fetchWalletSummaryById(walletId);
    const walletSummary = responseData.data;
    return Promise.resolve({
      statusCode: OK,
      data: walletSummary,
    });
  } catch (e) {
    logger.error(
      `Error occurred while fetching wallet summary by id ${walletId} with error ${JSON.stringify(
        e
      )}`
    );
    return Promise.reject({
      statusCode: NOT_FOUND,
      message: e.message || "Something went wrong. Please try again",
    });
  }
};

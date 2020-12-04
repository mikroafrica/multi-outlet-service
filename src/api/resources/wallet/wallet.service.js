import {
  fetchWalletSummaryById,
  fetchWalletTransactions,
} from "../../modules/wallet-service";
import logger from "../../../logger";
import { NOT_FOUND, OK } from "../../modules/status";

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
    const walletResponse = responseData.data;
    return Promise.resolve({
      statusCode: OK,
      data: walletResponse.data,
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
    const walletResponse = responseData.data;
    return Promise.resolve({
      statusCode: OK,
      data: walletResponse.data,
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

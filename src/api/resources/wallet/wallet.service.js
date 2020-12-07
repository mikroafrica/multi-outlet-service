import * as WalletService from "../../modules/wallet-service.js";
import * as ConsumerService from "../../modules/consumer-service.js";
import logger from "../../../logger.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";

export const walletTransactionsById = async ({
  dateFrom,
  dateTo,
  page,
  limit,
  transactionCategory,
  transactionType,
  userId,
}) => {
  let wallet;
  try {
    wallet = await getUserWalletByUserId(userId);
    if (!wallet.id) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Could not fetch wallet transactions",
      });
    }
  } catch (err) {
    logger.error(
      `Error occurred while fetching user wallet with error ${JSON.stringify(
        err
      )}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err.message || "Something went wrong. Please try again",
    });
  }

  const walletId = wallet.id;
  return WalletService.fetchWalletTransactions({
    page,
    limit,
    walletId,
    dateFrom,
    dateTo,
    transactionCategory,
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

export const walletSummaryById = async ({ userId }) => {
  let wallet;
  try {
    wallet = await getUserWalletByUserId(userId);
    if (!wallet.id) {
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: "Could not fetch wallet transactions",
      });
    }
  } catch (err) {
    logger.error(
      `Could not fetch user wallet with error ${JSON.stringify(err)}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: err.message || "Something went wrong. Please try again",
    });
  }

  const walletId = wallet.id;
  return WalletService.fetchWalletSummaryById(walletId)
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

const getUserWalletByUserId = async (userId) => {
  const userDetails = await ConsumerService.getUserDetails(userId);
  const store = userDetails.data.store;
  if (store.length > 0) {
    const wallets = store[0].wallet;
    if (wallets.length > 0) return wallets[0];
  }
  return {};
};

import * as WalletService from "../../modules/wallet-service.js";
import logger from "../../../logger.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import * as ConsumerService from "../../modules/consumer-service";
import { Owner } from "../owner/owner.model";
import { OutletStatus } from "../outlet/outlet.status";

export const walletById = async ({ ownerId }) => {
  logger.info(`Fetch wallet of outlet owner [${ownerId}]`);

  return Owner.findOne({ userId: ownerId })
    .then(async (owner) => {
      const walletId = owner.walletId;

      try {
        const wallet = await WalletService.getWalletById(walletId);
        console.log(wallet);
        const walletSummary = wallet.data;

        return Promise.resolve({
          statusCode: OK,
          data: walletSummary.data,
        });
      } catch (e) {
        return Promise.reject({
          statusCode: BAD_REQUEST,
          message: e.message || "Something went wrong. Please try again",
        });
      }
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching wallet by id ${walletId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: e.message,
      });
    });
};

export const walletSummaryById = async ({ walletId, dateFrom, dateTo }) => {
  const params = { walletId, dateFrom, dateTo };
  logger.info(
    `Wallet summary id with request params [${JSON.stringify(params)}]`
  );

  return WalletService.fetchWalletSummaryById(params)
    .then((responseData) => {
      const walletSummary = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: walletSummary.data,
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
        message: e.message || "Something went wrong. Please try again",
      });
    });
};

export const walletTransactionsById = async ({
  dateFrom,
  dateTo,
  page,
  limit,
  transactionCategory,
  transactionType,
  walletId,
}) => {
  const params = {
    page,
    limit,
    walletId,
    dateFrom,
    dateTo,
    transactionCategory,
    transactionType,
  };
  logger.info(
    `Fetch wallet transactions request body [${JSON.stringify(params)}]`
  );

  return WalletService.fetchWalletTransactions(params)
    .then((responseData) => {
      const walletTransactions = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: walletTransactions.data,
      });
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching wallet transactions by id ${walletId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message:
          e.message || "Could not fetch wallet transactions. Please try again",
      });
    });
};

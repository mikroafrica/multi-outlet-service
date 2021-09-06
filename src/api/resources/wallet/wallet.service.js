import * as WalletService from "../../modules/wallet-service.js";
import logger from "../../../logger.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import { Owner } from "../owner/owner.model";
import * as ConsumerService from "../../modules/consumer-service";

export const walletById = async ({ ownerId }) => {
  logger.info(`Fetch wallet of outlet owner [${ownerId}]`);

  return Owner.findOne({ userId: ownerId })
    .then(async (owner) => {
      const walletId = owner.walletId;

      try {
        const wallet = await WalletService.getWalletById(walletId);
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
        `Error occurred while fetching wallet of owner ${ownerId} with error ${JSON.stringify(
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

export const getIncomeAndExpenseSummaryForAdmin = async ({ ownerId }) => {
  try {
    const userDetails = await ConsumerService.getUserDetails(ownerId);
    const userDetailsData = userDetails.data;
    const userData = userDetailsData.data;
    const walletId = userData.store[0].wallet[0].id;

    logger.info(`Fetching user detils as [${JSON.stringify(userDetails)}]`);

    const params = {
      walletId,
      dateFrom: Date.now() - 15552000000,
      dateTo: Date.now(),
    };

    console.log("params", params);
    const responseData = await walletTransactionsById(params);
    const walletTransactions = responseData.data.list;

    const dateFrom = params.dateFrom;
    const dateTo = params.dateFrom + 2592000000;
    const transactionSummaryForFirstSixMonth = calculateTransactionSummary(
      dateFrom,
      dateTo,
      walletTransactions
    );

    return Promise.resolve({
      statusCode: OK,
      data: transactionSummaryForFirstSixMonth,
    });
  } catch (e) {
    logger.error(
      `Error occurred while computing wallet transaction summary by id ${walletId} with error ${JSON.stringify(
        e
      )}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message:
        e.message || "Could not fetch wallet transactions. Please try again",
    });
  }
};

const calculateTransactionSummary = (dateFrom, dateTo, walletTransactions) => {
  let transactionSummaryForFirstSixMonth = {};
  const startOfTransaction = dateFrom;
  const endOfTransaction = dateFrom + 2592000000;

  if (endOfTransaction >= Date.now()) return;

  const filteredTransactions = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= startOfTransaction &&
      transaction.timeCreated < endOfTransaction
  );

  const totalCreditTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let monthlyCredit;
  let monthlyDebit;
  transactionSummaryForFirstSixMonth.monthlyCredit = totalCreditTransactions;
  transactionSummaryForFirstSixMonth.monthlyDebit = totalDebitTransactions;

  calculateTransactionSummary(
    startOfTransaction + 2592000000,
    endOfFirstMonth + 2592000000,
    walletTransactions
  );

  console.log(
    "transactionSummaryForFirstSixMonth",
    transactionSummaryForFirstSixMonth
  );
  return transactionSummaryForFirstSixMonth;
};

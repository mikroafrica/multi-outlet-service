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
    const owner = await Owner.findOne({ userId: ownerId });
    const walletId = owner.walletId;

    logger.info(`Fetching owner detils as [${JSON.stringify(owner)}]`);

    const dateFrom = Date.now() - 15552000000;
    const dateTo = dateFrom + 2592000000;

    const summary = await getTransactionSummary(walletId, dateFrom, dateTo);

    return Promise.resolve({
      statusCode: OK,
      data: {
        firstMonthSummary: summary[0],
        secondMonthSummary: summary[1],
        thirdMonthSummary: summary[2],
        fourthMonthSummary: summary[3],
        fifthMonthSummary: summary[4],
        sixthMonthSummary: summary[5],
      },
    });
  } catch (e) {
    logger.error(
      `Error occurred while fetching wallet transaction summary with error ${JSON.stringify(
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

const getTransactionSummary = async (walletId, dateFrom, dateTo) => {
  let monthlyTransactionSummary = {};
  let incomeAndExpenseSummary = [];

  const params = transactionParams(walletId, dateFrom, dateTo);

  let credit, debit;
  for (let param of params) {
    try {
      const responseData = await WalletService.fetchWalletSummaryById(param);
      const walletTransactions = responseData.data.data;

      monthlyTransactionSummary.credit = walletTransactions.totalCredit;
      monthlyTransactionSummary.debit = walletTransactions.totalDebit;

      incomeAndExpenseSummary.push({ ...monthlyTransactionSummary });
    } catch (err) {
      logger.error(
        `Error occurred while fetching wallet transaction summary with error ${JSON.stringify(
          err
        )}`
      );
    }
  }

  return Promise.resolve(incomeAndExpenseSummary);
};

const transactionParams = (walletId, dateFrom, dateTo) => {
  const params = [
    { walletId, dateFrom, dateTo },
    { walletId, dateFrom: dateFrom + 2592000000, dateTo: dateTo + 2592000000 },
    { walletId, dateFrom: dateFrom + 5184000000, dateTo: dateTo + 5184000000 },
    {
      walletId,
      dateFrom: dateFrom + 10368000000,
      dateTo: dateTo + 10368000000,
    },
    {
      walletId,
      dateFrom: dateFrom + 12960000000,
      dateTo: dateTo + 12960000000,
    },
    {
      walletId,
      dateFrom: dateFrom + 15552000000,
      dateTo: dateTo + 15552000000,
    },
  ];
  return params;
};

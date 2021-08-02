import * as WalletService from "../../modules/wallet-service.js";
import logger from "../../../logger.js";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import { Owner } from "../owner/owner.model";

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

export const getIncomeAndExpenseSummaryForAdmin = async ({ walletId }) => {
  const params = {
    walletId,
    dateFrom: Date.now() - 15552000000,
    dateTo: Date.now(),
  };
  logger.info(
    `Fetch wallet transactions request body [${JSON.stringify(params)}]`
  );
  try {
    const responseData = await walletTransactionsById(params);
    const walletTransactions = responseData.data.list;

    const firstMonthSummary = calculateTransactionsForFirstMonth({
      params,
      walletTransactions,
    });

    const secondMonthSummary = calculateTransactionsForSecondMonth({
      params,
      walletTransactions,
    });

    const thirdMonthSummary = calculateTransactionsForThirdMonth({
      params,
      walletTransactions,
    });

    const fourthMonthSummary = calculateTransactionsForFourthMonth({
      params,
      walletTransactions,
    });

    const fifthMonthSummary = calculateTransactionsForFifthMonth({
      params,
      walletTransactions,
    });

    const sixthMonthSummary = calculateTransactionsForSixthMonth({
      params,
      walletTransactions,
    });

    const incomeAndExpenseSummaryForTheLastSixthMonth = {
      ...firstMonthSummary,
      ...secondMonthSummary,
      ...thirdMonthSummary,
      ...fourthMonthSummary,
      ...fifthMonthSummary,
      ...sixthMonthSummary,
    };

    return Promise.resolve({
      statusCode: OK,
      data: incomeAndExpenseSummaryForTheLastSixthMonth,
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

const calculateTransactionsForFirstMonth = ({ params, walletTransactions }) => {
  let firstMonthSummary = {};
  const endOfFirstMonth = params.dateFrom + 2592000000;

  const filteredTransactionForFirstMonth = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= params.dateFrom &&
      transaction.timeCreated < endOfFirstMonth
  );

  const totalCreditTransactionsForFirstMonth = filteredTransactionForFirstMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactionsForFirstMonth = filteredTransactionForFirstMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let firstMonthCredit;
  let firstMonthDebit;
  firstMonthSummary.firstMonthCredit = totalCreditTransactionsForFirstMonth;
  firstMonthSummary.firstMonthDebit = totalDebitTransactionsForFirstMonth;

  return firstMonthSummary;
};

const calculateTransactionsForSecondMonth = ({
  params,
  walletTransactions,
}) => {
  let secondMonthSummary = {};
  const startOfSecondMonth = params.dateFrom + 2592000000;
  const endOfSecondMonth = params.dateFrom + 5184000000;

  const filteredTransactionForSecondMonth = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= startOfSecondMonth &&
      transaction.timeCreated < endOfSecondMonth
  );

  const totalCreditTransactionsForSecondMonth = filteredTransactionForSecondMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactionsForSecondMonth = filteredTransactionForSecondMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let secondMonthCredit;
  let secondMonthDebit;
  secondMonthSummary.secondMonthCredit = totalCreditTransactionsForSecondMonth;
  secondMonthSummary.secondMonthDebit = totalDebitTransactionsForSecondMonth;
  return secondMonthSummary;
};

const calculateTransactionsForThirdMonth = ({ params, walletTransactions }) => {
  let thirdMonthSummary = {};
  const startOfThirdMonth = params.dateFrom + 5184000000;
  const endOfThirdMonth = params.dateFrom + 7776000000;

  const filteredTransactionForThirdMonth = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= startOfThirdMonth &&
      transaction.timeCreated < endOfThirdMonth
  );

  const totalCreditTransactionsForThirdMonth = filteredTransactionForThirdMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactionsForThirdMonth = filteredTransactionForThirdMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let thirdMonthCredit;
  let thirdMonthDebit;
  thirdMonthSummary.thirdMonthCredit = totalCreditTransactionsForThirdMonth;
  thirdMonthSummary.thirdMonthDebit = totalDebitTransactionsForThirdMonth;
  return thirdMonthSummary;
};

const calculateTransactionsForFourthMonth = ({
  params,
  walletTransactions,
}) => {
  let fourthMonthSummary = {};
  const startOfFourthMonth = params.dateFrom + 7776000000;
  const endOfFourthMonth = params.dateFrom + 10368000000;

  const filteredTransactionForFourthMonth = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= startOfFourthMonth &&
      transaction.timeCreated < endOfFourthMonth
  );

  const totalCreditTransactionsForFourthMonth = filteredTransactionForFourthMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactionsForFourthMonth = filteredTransactionForFourthMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let fourthMonthCredit;
  let fourthMonthDebit;
  fourthMonthSummary.fourthMonthCredit = totalCreditTransactionsForFourthMonth;
  fourthMonthSummary.fourthMonthDebit = totalDebitTransactionsForFourthMonth;
  return fourthMonthSummary;
};

const calculateTransactionsForFifthMonth = ({ params, walletTransactions }) => {
  let fifthMonthSummary = {};
  const startOfFifthMonth = params.dateFrom + 10368000000;
  const endOfFifthMonth = params.dateFrom + 12960000000;

  const filteredTransactionForFifthMonth = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= startOfFifthMonth &&
      transaction.timeCreated < endOfFifthMonth
  );

  const totalCreditTransactionsForFifthMonth = filteredTransactionForFifthMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactionsForFifthMonth = filteredTransactionForFifthMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let fifthMonthCredit;
  let fifthMonthDebit;
  fifthMonthSummary.fifthMonthCredit = totalCreditTransactionsForFifthMonth;
  fifthMonthSummary.fifthMonthDebit = totalDebitTransactionsForFifthMonth;
  return fifthMonthSummary;
};

const calculateTransactionsForSixthMonth = ({ params, walletTransactions }) => {
  let sixthMonthSummary = {};
  const startOfSixthMonth = params.dateFrom + 12960000000;
  const endOfSixthMonth = params.dateTo;

  const filteredTransactionForSixthMonth = walletTransactions.filter(
    (transaction) =>
      transaction.timeCreated >= startOfSixthMonth &&
      transaction.timeCreated < endOfSixthMonth
  );

  const totalCreditTransactionsForSixthMonth = filteredTransactionForSixthMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "CREDIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  const totalDebitTransactionsForSixthMonth = filteredTransactionForSixthMonth.reduce(
    (acc, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        return acc + transaction.amount;
      }
      return acc;
    },
    0
  );

  let sixthMonthCredit;
  let sixthMonthDebit;
  sixthMonthSummary.sixthMonthCredit = totalCreditTransactionsForSixthMonth;
  sixthMonthSummary.sixthMonthDebit = totalDebitTransactionsForSixthMonth;
  return sixthMonthSummary;
};

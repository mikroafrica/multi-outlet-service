import async from "async";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import * as TransactionService from "../../modules/transaction-service.js";
import logger from "../../../logger.js";
import { Outlet } from "../outlet/outlet.model";
import * as OutletService from "../outlet/outlet.service";

export const fetchOutletTransactions = async ({
  outletId,
  type,
  status,
  page,
  limit,
  dateFrom,
  dateTo,
  customerBillerId,
}) => {
  if (!outletId) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: "Outlet Id is required",
    });
  }

  const params = {
    userId: outletId,
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
        `Error occurred while fetching transaction by user id ${outletId} with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: e.message || "Something went wrong. Please try again",
      });
    });
};

export const getTransactionsSummary = async ({
  ownerId,
  dateFrom,
  page,
  limit,
  dateTo,
}) => {
  const params = {
    userId: ownerId,
    page,
    limit,
    dateFrom,
    dateTo,
  };

  logger.info(`Transaction Summary request body ${JSON.stringify(params)}`);

  return Outlet.paginate(
    {
      ownerId,
    },
    { page, limit, sort: { createdAt: -1 } }
  )
    .then(async (outlets) => {
      const outletDetails = await OutletService.fetchOutletDetails(
        outlets.docs
      );
      const transactionSummaryForOutlets = await fetchOutletsTransactionSummary(
        outletDetails,
        dateFrom,
        dateTo
      );
      return Promise.resolve({
        statusCode: OK,
        data: transactionSummaryForOutlets,
      });
    })
    .catch((e) => {
      logger.error(
        `Error occurred while fetching transaction summary for multi-outlet with error ${JSON.stringify(
          e
        )}`
      );
      return Promise.reject({
        statusCode: BAD_REQUEST,
        message: e.message || "Something went wrong. Please try again",
      });
    });
};

const fetchOutletsTransactionSummary = async (outlets, dateFrom, dateTo) => {
  const outletsTransactionSummary = [];
  await async.forEach(outlets, async (outlet) => {
    try {
      const outletUserId = outlet.id;

      const params = {
        userId: outletUserId,
        dateFrom,
        dateTo,
      };
      const outletTransactions = await TransactionService.transactionsCategorySummary(
        params
      );

      const outletTransactionData = outletTransactions.data.data;

      let transactionSummary = {
        transactionValue: 0,
        transactionVolume: 0,
      };

      if (outletTransactionData.length > 0) {
        transactionSummary.transactionVolume = outletTransactionData.reduce(
          (total, curr) => curr.success + total,
          0
        );
        transactionSummary.transactionValue = outletTransactionData.reduce(
          (total, curr) => curr.successfulAmount + total,
          0
        );
      }

      outletsTransactionSummary.push({ ...transactionSummary, ...outlet });
    } catch (e) {
      logger.error(
        `Failed to fetch transaction summary for user ${
          outlet.id
        } with error ${JSON.stringify(e)}`
      );
    }
  });

  return Promise.resolve(outletsTransactionSummary);
};

export const outletTransactionSummary = async ({
  outletId,
  dateFrom,
  dateTo,
}) => {
  try {
    let outletTransactionSummary = {
      count: 0,
      success: 0,
      pending: 0,
      failed: 0,
      successfulAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      totalAmount: 0,
    };

    const transactionKeys = Object.keys(outletTransactionSummary);
    const response = await TransactionService.transactionsCategorySummary({
      userId: outletId,
      dateFrom,
      dateTo,
    });
    const responseData = response.data;
    const transactionSummaryResponse = responseData.data;

    for (let transactionKey of transactionKeys) {
      let currentValue = 0.0;
      // sum up the corresponding keys in the array
      transactionSummaryResponse.forEach(function (data) {
        currentValue += parseFloat(data[transactionKey] || 0);
      });
      // ensure the current value for the key is exactly in two decimal place
      outletTransactionSummary[transactionKey] = parseFloat(
        currentValue
      ).toFixed(2);
    }

    let outletTransactionTypesSummary = computeOutletTransactionTypes(
      transactionSummaryResponse,
      outletTransactionSummary.successfulAmount
    );

    return Promise.resolve({
      statusCode: OK,
      data: {
        summary: outletTransactionSummary,
        types: outletTransactionTypesSummary,
      },
    });
  } catch (e) {
    logger.error(
      `Error occurred while fetching transaction summary for outlet with error ${JSON.stringify(
        e
      )}`
    );
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: e.message || "Something went wrong. Please try again",
    });
  }
};

const computeOutletTransactionTypes = (
  transactionTypes,
  totalSuccessAmount
) => {
  let computedTransactionTypes = [];
  let billTransactions = {
    count: 0,
    type: "Bills",
    success: 0,
    pending: 0,
    failed: 0,
    successfulAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    totalAmount: 0,
  };

  const bills = ["airtime", "data", "cable tv", "phcn"];

  for (let transactionType of transactionTypes) {
    if (bills.includes(transactionType.type.toLowerCase())) {
      billTransactions = {
        ...billTransactions,
        count: billTransactions.count + transactionType.count,
        success: billTransactions.success + transactionType.success,
        pending: billTransactions.pending + transactionType.pending,
        failed: billTransactions.failed + transactionType.failed,
        successfulAmount:
          billTransactions.successfulAmount + transactionType.successfulAmount,
        pendingAmount:
          billTransactions.pendingAmount + transactionType.pendingAmount,
        failedAmount:
          billTransactions.failedAmount + transactionType.failedAmount,
        totalAmount: billTransactions.totalAmount + transactionType.totalAmount,
      };
    } else {
      transactionType.percentageAmount = +(
        (transactionType.successfulAmount / totalSuccessAmount) *
        100
      ).toFixed(2);
      computedTransactionTypes.push(transactionType);
    }
  }
  if (billTransactions.count > 0) {
    billTransactions.percentageAmount = +(
      (billTransactions.successfulAmount / totalSuccessAmount) *
      100
    ).toFixed(2);
    computedTransactionTypes.push(billTransactions);
  }
  return computedTransactionTypes;
};

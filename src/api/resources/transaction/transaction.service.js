import async from "async";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import * as TransactionService from "../../modules/transaction-service.js";
import logger from "../../../logger.js";
import { OutletStatus } from "../outlet/outlet.status";
import { Outlet } from "../outlet/outlet.model";
import { fetchOutletDetails } from "../outlet/outlet.service";

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

export const getTransactionsSummary = async ({
  userId,
  dateFrom,
  page,
  limit,
  dateTo,
}) => {
  const params = {
    userId,
    page,
    limit,
    dateFrom,
    dateTo,
  };

  logger.info(`Get transaction Summary request body ${JSON.stringify(params)}`);

  return Outlet.paginate(
    {
      ownerId: userId,
      $or: [
        { status: OutletStatus.ACTIVE },
        { status: OutletStatus.SUSPENDED },
      ],
    },
    { page, limit }
  )
    .then(async (outlets) => {
      const outletDetails = await fetchOutletDetails(outlets.docs);
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
      const outletTransactions = await TransactionService.fetchTransactionSummary(
        params
      );

      const outletTransactionData = outletTransactions.data.data;
      let transactionSummary = {
        transactionCount: 0,
        transactionVolume: 0,
      };

      if (outletTransactionData.length > 0) {
        transactionSummary.transactionCount = outletTransactionData.reduce(
          (total, curr) => curr.success + total,
          0
        );
        transactionSummary.transactionVolume = outletTransactionData.reduce(
          (total, curr) => curr.successAmount + total,
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

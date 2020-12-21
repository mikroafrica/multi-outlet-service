import async from "async";
import { BAD_REQUEST, OK } from "../../modules/status.js";
import * as TransactionService from "../../modules/transaction-service.js";
import logger from "../../../logger.js";
import { OutletStatus } from "../outlet/outlet.status";
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
      $or: [
        { status: OutletStatus.ACTIVE },
        { status: OutletStatus.SUSPENDED },
      ],
    },
    { page, limit }
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
      const outletTransactions = await TransactionService.fetchTransactionSummary(
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

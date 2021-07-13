import { Outlet } from "../../outlet/outlet.model";
import * as TransactionService from "../../../modules/transaction-service";
import { OK } from "../../../modules/status";

export const transactionSummary = async ({ ownerId, dateFrom, dateTo }) => {
  const outlets = await Outlet.find({ ownerId });
  const outletUserIds = outlets.map(function (outlet) {
    return outlet.userId;
  });

  const tnxSummaryResponse = await TransactionService.transactionsCategorySummaryByUserIds(
    { userIds: outletUserIds, dateFrom, dateTo }
  );

  const { data } = tnxSummaryResponse.data;

  return Promise.resolve({
    statusCode: OK,
    data,
  });
};

export const transactionsByOutlets = async ({
  ownerId,
  dateFrom,
  dateTo,
  customerBillerId,
  status,
  type,
  page,
  limit,
}) => {
  const outlets = await Outlet.find({ ownerId });
  const outletUserIds = outlets.map(function (outlet) {
    return outlet.userId;
  });

  const tnxResponse = await TransactionService.transactionsByUserIds({
    page,
    limit,
    type,
    userIds: outletUserIds,
    dateFrom,
    dateTo,
    status,
    customerBillerId,
  });

  const { data } = tnxResponse.data;

  return Promise.resolve({
    statusCode: OK,
    data,
  });
};

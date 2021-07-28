import { Outlet } from "../../outlet/outlet.model";
import * as TransactionService from "../../../modules/transaction-service";
import * as ReportService from "../../../modules/report-service";
import { OK } from "../../../modules/status";
import { getUserIdsUnderOwnerById } from "../../owner/owner.service";
import { handleListOfHits, transformDoc } from "../../../modules/util";
import { OwnerCommission } from "../../commission/owner.commission.model";
import {
  Commission,
  FeeType,
  RangeType,
} from "../../commission/commission.model";
import { ReportIndex } from "../../../modules/report-service";

export const transactionSummary = async ({ ownerId, dateFrom, dateTo }) => {
  // get all the user ids under this particular owner id
  const outletUserIds = await getUserIdsUnderOwnerById({ ownerId });

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

  const should = outletUserIds.map(function (userId) {
    return { match: { userId } };
  });
  if (dateFrom && dateTo) {
    should.push({
      range: {
        timeCreated: {
          gte: new Date(parseInt(dateFrom)),
          lte: new Date(parseInt(dateTo)),
        },
      },
    });
  }
  if (customerBillerId) {
    should.push({
      match: {
        customerBillerId,
      },
    });
  }

  if (status) {
    should.push({
      match: {
        status,
      },
    });
  }

  if (type) {
    should.push({
      match: {
        transactionType: type.toLocaleUpperCase(),
      },
    });
  }

  const query = {
    index: ReportIndex.TRANSACTION,
    from: page,
    size: limit,
    _source: [
      "transactionType",
      "profileImageId",
      "firstName",
      "lastName",
      "phoneNumber",
      "amount",
      "customerBillerId",
      "product",
      "reference",
      "transactionStatus",
      "timeCreated",
    ],
    body: {
      query: {
        bool: {
          must: {
            bool: {
              should: should,
            },
          },
        },
      },
      sort: {
        timeCreated: { order: "desc" },
      },
    },
  };

  const [queryResponse, ownerCommission] = await Promise.all([
    ReportService.search(query),
    OwnerCommission.find({ ownerId }),
  ]);

  const { data: queryResponseData } = queryResponse.data;
  let { list: transactionList, total } = handleListOfHits(queryResponseData);

  transactionList = await Promise.all(
    transactionList.map(async function (transaction) {
      const commission = await findCommission(
        ownerCommission,
        transaction.amount,
        transaction.transactionType
      );
      return { ...transaction, partnerCommission: commission || 0 };
    })
  );
  return Promise.resolve({
    statusCode: OK,
    data: {
      list: transactionList,
      total,
    },
  });
};

const findCommission = async (
  ownerCommissions,
  amount: number,
  transactionType: string
) => {
  const commissionList = await ownerCommissions.map(async function (
    ownerCommission
  ) {
    return Commission.findOne({
      _id: ownerCommission.commissionId,
    });
  });

  if (transactionType === "WITHDRAWAL") {
    transactionType = "POS_WITHDRAWAL";
  }

  const commission = await commissionList.find(async (commission) => {
    const _commission = await commission;
    return _commission.category === transactionType;
  });

  if (!commission) {
    return 0;
  }

  // if service fee is flat , return exact flat fee
  const isFlat = commission.feeType === FeeType.FLAT_FEE;
  if (isFlat) {
    return commission.serviceFee;
  }

  // check if service fee does not have range, multiply by percent
  if (commission.rangeType === RangeType.NON_RANGE) {
    return (commission.serviceFee / 100) * amount;
  }

  // if range type, search for the exact match
  const rangeList = commission.rangeList;
  const rangeObject = rangeList.find(
    (range) =>
      range.rangeAmount.from >= amount && range.rangeAmount.to <= amount
  );

  // if range found is flat fee, return exact amount
  if (rangeObject && rangeObject.feeType === FeeType.FLAT_FEE) {
    return rangeObject.serviceFee;
  }

  // if range found is percentage, multiply by percent
  if (rangeObject && rangeObject.feeType === FeeType.PERCENTAGE) {
    return (rangeObject.serviceFee / 100) * amount;
  }

  return 0;
};

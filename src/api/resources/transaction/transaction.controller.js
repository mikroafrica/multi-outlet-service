import {
  fetchOutletTransactions,
  getTransactionsSummary,
  outletTransactionSummary,
} from "./transaction.service.js";

export const fetchTransactionsByOutletId = (req, res) => {
  const outletId = req.params.id;

  const {
    type,
    status,
    page,
    limit,
    dateFrom,
    dateTo,
    customerBillerId,
  } = req.query;
  fetchOutletTransactions({
    outletId,
    type,
    status,
    page,
    limit,
    dateFrom,
    dateTo,
    customerBillerId,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const fetchTransactionSummary = (req, res) => {
  const ownerId = req.user.userId;

  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  getTransactionsSummary({
    ownerId,
    dateFrom,
    dateTo,
    page,
    limit,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const fetchOutletTransactionSummary = (req, res) => {
  const outletId = req.params.id;
  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;

  outletTransactionSummary({ outletId, dateFrom, dateTo })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

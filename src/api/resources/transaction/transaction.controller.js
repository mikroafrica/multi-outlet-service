import {
  fetchUserTransactions,
  getTransactionsCategorySummary,
  getTransactionsSummary,
} from "./transaction.service.js";

export const fetchTransactionsByUserId = (req, res) => {
  const userId = req.params.id;

  const {
    type,
    status,
    page,
    limit,
    dateFrom,
    dateTo,
    customerBillerId,
  } = req.query;
  fetchUserTransactions({
    userId,
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
  const userId = req.user.userId;

  const dateFrom = req.query.dateFrom || 1601506800000;
  const dateTo = req.query.dateTo || Date.now();
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  getTransactionsSummary({
    userId,
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

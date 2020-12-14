import {
  fetchUserTransactions,
  getTransactionsCategorySummary,
  getTransactionSummary,
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

export const fetchTransactionsByCategory = (req, res) => {
  const userId = req.params.id;

  const { dateFrom, dateTo } = req.query;
  getTransactionsCategorySummary({
    userId,
    dateFrom,
    dateTo,
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

  getTransactionSummary({
    userId,
    dateFrom,
    dateTo,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

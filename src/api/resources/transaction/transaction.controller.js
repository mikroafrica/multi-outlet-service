import {
  fetchUserTransactions,
  getTransactionsCategorySummary,
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

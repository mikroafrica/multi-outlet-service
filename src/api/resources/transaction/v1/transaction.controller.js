import {
  transactionsByOutlets,
  transactionSummary,
} from "./transaction.service";

export const fetchTransactionSummary = (req, res) => {
  const ownerId = req.user.userId;

  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;

  transactionSummary({
    ownerId,
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

export const fetchTransaction = (req, res) => {
  const ownerId = req.user.userId;

  const {
    dateFrom,
    dateTo,
    status,
    type,
    customerBillerId,
    page,
    limit,
  } = req.query;

  transactionsByOutlets({
    ownerId,
    dateFrom,
    dateTo,
    status,
    type,
    page,
    limit,
    customerBillerId,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

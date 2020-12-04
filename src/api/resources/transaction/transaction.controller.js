import { fetchUserTransactions } from "./transaction.service.js";

export const fetchTransactionsByUserId = (req, res) => {
  const {
    userId,
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
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
  //    service fetchUserTransactions(userId)
};

import { walletTransactionsById, walletSummaryById } from "./wallet.service.js";

export const getWalletTransactions = (req, res) => {
  const userId = req.user.userId;

  const {
    dateFrom,
    dateTo,
    page,
    limit,
    transactionCategory,
    transactionType,
  } = req.query;

  walletTransactionsById({
    dateFrom,
    dateTo,
    page,
    limit,
    transactionCategory,
    transactionType,
    userId,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getWalletSummary = (req, res) => {
  const userId = req.user.userId;

  walletSummaryById({ userId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

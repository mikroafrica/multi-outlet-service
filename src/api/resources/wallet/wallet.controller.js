import { walletTransactionsById, walletSummaryById } from "./wallet.service.js";

export const getWalletTransactions = (req, res) => {
  const walletId = req.params.id;
  const { dateFrom, dateTo, page, limit, transactionType } = req.query;

  walletTransactionsById({
    walletId,
    dateFrom,
    dateTo,
    page,
    limit,
    transactionType,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getWalletSummary = (req, res) => {
  const walletId = req.params.id;

  walletSummaryById({ walletId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

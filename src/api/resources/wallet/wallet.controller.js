import { walletTransactionsById, walletSummaryById } from "./wallet.service.js";

//ADD FILTER BY OUTLET. FIGURE OUT HOW TO FILTER BY MULTIPLE OUTLETS
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
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
};

export const getWalletSummary = (req, res) => {
  const walletId = req.params.id;

  walletSummaryById({ walletId })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
};

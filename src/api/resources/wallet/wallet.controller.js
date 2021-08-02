import {
  walletTransactionsById,
  walletSummaryById,
  walletById,
  getIncomeAndExpenseSummaryForAdmin,
} from "./wallet.service.js";

export const getWallet = (req, res) => {
  // const ownerId = req.user.userId;
  const ownerId = req.params.userId;

  walletById({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getWalletSummary = (req, res) => {
  const walletId = req.params.id;
  const { dateFrom, dateTo } = req.query;

  walletSummaryById({ walletId, dateFrom, dateTo })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getWalletTransactions = (req, res) => {
  const walletId = req.params.id;

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
    walletId,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getIncomeSummary = (req, res) => {
  const walletId = req.params.id;

  getIncomeAndExpenseSummaryForAdmin({
    walletId,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

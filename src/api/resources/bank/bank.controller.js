import {
  createPersonalBankAccount,
  fetchCreatedBankAccounts,
} from "./bank.service";

export const fetchBankAccounts = (req, res) => {
  const userId = req.user.userId;

  fetchCreatedBankAccounts({ userId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const createBankAccount = (req, res) => {
  const userId = req.user.userId;
  const params = req.body;

  createPersonalBankAccount({ userId, params })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

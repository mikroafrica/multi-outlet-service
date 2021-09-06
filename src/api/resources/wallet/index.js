import {
  getWalletTransactions,
  getWalletSummary,
  getWallet,
  getIncomeSummary,
} from "./wallet.controller.js";

const wallet = ({ server, subBase }) => {
  server.get(`${subBase}/:userId`, getWallet);
  server.get(`${subBase}/:id/summary`, getWalletSummary);
  server.get(`${subBase}/:id/transactions`, getWalletTransactions);
  server.get(`${subBase}/summary`, getIncomeSummary);
};

export default wallet;

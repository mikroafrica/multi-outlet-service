import {
  getWalletTransactions,
  getWalletSummary,
  getWallet,
} from "./wallet.controller.js";

const wallet = ({ server, subBase }) => {
  server.get(`${subBase}`, getWallet);
  server.get(`${subBase}/:id/summary`, getWalletSummary);
  server.get(`${subBase}/:id/transactions`, getWalletTransactions);
};

export default wallet;

import {
  getWalletTransactions,
  getWalletSummary,
} from "./wallet.controller.js";

const wallet = ({ server, subBase }) => {
  server.get(`${subBase}/:userId`, getWalletTransactions);
  server.get(`${subBase}/:userId/summary`, getWalletSummary);
};

export default wallet;

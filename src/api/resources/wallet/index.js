import {
  getWalletTransactions,
  getWalletSummary,
} from "./wallet.controller.js";

const wallet = ({ server, subBase }) => {
  server.get(`${subBase}/:id`, getWalletTransactions);
  server.get(`${subBase}/:id/summary`, getWalletSummary);
};

export default wallet;

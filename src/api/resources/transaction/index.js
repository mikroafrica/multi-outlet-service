import {
  fetchOutletTransactionSummary,
  fetchTransactionsByOutletId,
  fetchTransactionSummary,
} from "./transaction.controller.js";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}/:id`, fetchTransactionsByOutletId);
  server.get(`${subBase}/summary`, fetchTransactionSummary);
  server.get(`${subBase}/summary/:id`, fetchOutletTransactionSummary);
};

export default transaction;

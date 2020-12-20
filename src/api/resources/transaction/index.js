import {
  fetchTransactionsByCategory,
  fetchTransactionsByOutletId,
  fetchTransactionSummary,
} from "./transaction.controller.js";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}/:id`, fetchTransactionsByOutletId);
  server.get(`${subBase}/summary`, fetchTransactionSummary);
};

export default transaction;

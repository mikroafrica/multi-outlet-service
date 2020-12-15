import {
  fetchTransactionsByCategory,
  fetchTransactionsByUserId,
  fetchTransactionSummary,
} from "./transaction.controller.js";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}/:id`, fetchTransactionsByUserId);
  server.get(`${subBase}/summary`, fetchTransactionSummary);
};

export default transaction;

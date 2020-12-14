import {
  fetchTransactionsByCategory,
  fetchTransactionsByUserId,
  fetchTransactionSummary,
} from "./transaction.controller.js";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}/:id`, fetchTransactionsByUserId);
  server.get(`${subBase}/:id/category-summary`, fetchTransactionsByCategory);
  server.get(`${subBase}/summary`, fetchTransactionSummary);
};

export default transaction;

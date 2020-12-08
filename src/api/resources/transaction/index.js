import {
  fetchTransactionsByCategory,
  fetchTransactionsByUserId,
} from "./transaction.controller.js";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}/:id`, fetchTransactionsByUserId);
  server.get(`${subBase}/:id/category-summary`, fetchTransactionsByCategory);
};

export default transaction;

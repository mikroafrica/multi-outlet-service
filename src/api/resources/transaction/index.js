import { fetchTransactionsByUserId } from "./transaction.controller.js";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}`, fetchTransactionsByUserId);
};

export default transaction;

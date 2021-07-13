import {
  fetchTransaction,
  fetchTransactionSummary,
} from "./transaction.controller";

const transaction = ({ server, subBase }) => {
  server.get(`${subBase}`, fetchTransaction);
  server.get(`${subBase}/summary`, fetchTransactionSummary);
};

export default transaction;

import { createBankAccount, fetchBankAccounts } from "./bank.controller";

const bank = ({ server, subBase }) => {
  server.get(`${subBase}/beneficiary`, fetchBankAccounts);
  server.post(`${subBase}/beneficiary`, createBankAccount);
};

export default bank;

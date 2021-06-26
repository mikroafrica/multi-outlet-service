import {
  createCommission,
  getCommission,
  updateCommission,
} from "./commission.controller";

const commission = ({ server, subBase }) => {
  server.get(`${subBase}`, getCommission);
  server.post(`${subBase}`, createCommission);
  server.put(`${subBase}/:id`, updateCommission);
};

export default commission;

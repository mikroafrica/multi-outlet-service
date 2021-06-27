import {
  createCommission,
  getCommission,
  ownersCommission,
  updateCommission,
} from "./commission.controller";

const commission = ({ server, subBase }) => {
  server.get(`${subBase}`, getCommission);
  server.post(`${subBase}`, createCommission);
  server.put(`${subBase}/:id`, updateCommission);
  server.post(`${subBase}/:id/owner`, ownersCommission);
};

export default commission;

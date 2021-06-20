import {
  createCommissionForOwner,
  ownerCommissionBalance,
  ownerCommissionSettings,
  updateCommissionSetting,
  fetchOwnerTransferCommissions,
} from "./commission.controller";

const commission = ({ server, subBase }) => {
  server.post(`${subBase}/:ownerId`, createCommissionForOwner);
  server.get(`${subBase}/:ownerId/balance`, ownerCommissionBalance);
  server.get(`${subBase}/:ownerId/settings`, ownerCommissionSettings);
  server.get(`${subBase}/:ownerId/transfers`, fetchOwnerTransferCommissions);
  server.put(`${subBase}/:id`, updateCommissionSetting);
};

export default commission;

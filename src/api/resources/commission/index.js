import {
  createCommissionForOwner,
  ownerCommissionBalance,
  ownerCommissionSettings,
  updateCommissionSetting,
  fetchOwnerTransferCommissions,
} from "./commission.controller";

const commission = ({ server, subBase }) => {
  server.post(`${subBase}/set-commission/:id`, createCommissionForOwner);
  server.get(`${subBase}/commission-balance/:id`, ownerCommissionBalance);
  server.get(`${subBase}/commission-setting/:id`, ownerCommissionSettings);
  server.get(`${subBase}/transfers/:id`, fetchOwnerTransferCommissions);
  server.put(
    `${subBase}/update-commission/:id/:commissionId`,
    updateCommissionSetting
  );
};

export default commission;

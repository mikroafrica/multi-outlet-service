import {
  createCommissionForOwner,
  ownerApprovalStatus,
  ownerCommissionBalance,
  ownerCommissionSettings,
  updateCommissionSetting,
} from "./commission.controller";

const commission = ({ server, subBase }) => {
  server.post(`${subBase}/set-commission/:id`, createCommissionForOwner);
  server.get(`${subBase}/approval-status/:id`, ownerApprovalStatus);
  server.get(`${subBase}/commission-balance/:id`, ownerCommissionBalance);
  server.get(`${subBase}/commission-setting/:id`, ownerCommissionSettings);
  server.put(
    `${subBase}/update-commission/:id/:commissionId`,
    updateCommissionSetting
  );
};

export default commission;

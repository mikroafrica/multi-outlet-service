import {
  createCommissionForPartner,
  partnerApprovalStatus,
  partnerCommissionBalance,
  partnerCommissionSettings,
  updateCommissionSettings,
} from "./commission.controller";

const commission = ({ server, subBase }) => {
  server.post(`${subBase}/commissions/:id`, createCommissionForPartner);
  server.get(`${subBase}/user/:id`, partnerApprovalStatus);
  server.get(`${subBase}/commission-balance/:id`, partnerCommissionBalance);
  server.get(`${subBase}/commission-setting/:id`, partnerCommissionSettings);
  server.put(
    `${subBase}/update-commission/:id/:commissionId`,
    updateCommissionSettings
  );
};

export default commission;

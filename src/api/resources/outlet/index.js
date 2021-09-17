import {
  tempUserCreation,
  createOutlet,
  validateOTP,
  linkOutlet,
  linkOutletToOwner,
  unlinkOutlet,
  unlinkSavedOutlet,
  verifyLinkedOutlet,
  fetchOutlets,
  switchOutletStatus,
  fetchOutletById,
} from "./outlet.controller";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/verify-phone`, tempUserCreation);
  server.post(`${subBase}/:registrationId/create`, createOutlet);
  server.put(`${subBase}/:registrationId/validate`, validateOTP);
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/link-outlet/:id`, linkOutletToOwner);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
  server.put(`${subBase}/:id/unlink`, unlinkOutlet);
  server.put(`${subBase}/:userId/:id/unlink`, unlinkSavedOutlet);
  server.put(`${subBase}/:id/:status`, switchOutletStatus);
  server.get(`${subBase}`, fetchOutlets);
  server.get(`${subBase}/:id`, fetchOutletById);
};

export default outlet;

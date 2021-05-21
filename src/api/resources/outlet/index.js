import {
  linkOutlet,
  linkOutletToOwner,
  unlinkOutlet,
  verifyLinkedOutlet,
  fetchOutlets,
  suspendOutletUser,
  unSuspendOutletUser,
  switchOutletStatus,
  fetchOutletById,
} from "./outlet.controller";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/link-outlet/:id`, linkOutletToOwner);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
  server.put(`${subBase}/:id/unlink`, unlinkOutlet);
  server.put(`${subBase}/:id/:status`, switchOutletStatus);
  server.get(`${subBase}`, fetchOutlets);
  server.get(`${subBase}/:id`, fetchOutletById);
};

export default outlet;

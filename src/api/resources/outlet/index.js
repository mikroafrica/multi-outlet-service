import {
  linkOutlet,
  unlinkOutlet,
  verifyLinkedOutlet,
  fetchOutlets,
  suspendOutletUser,
  unSuspendOutletUser,
  switchOutletStatus,
} from "./outlet.controller";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
  server.put(`${subBase}/:id/unlink`, unlinkOutlet);
  server.put(`${subBase}/:id/:status`, switchOutletStatus);
  server.get(`${subBase}`, fetchOutlets);
};

export default outlet;

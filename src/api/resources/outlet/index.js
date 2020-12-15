import {
  linkOutlet,
  unlinkOutlet,
  verifyLinkedOutlet,
  fetchOutlets,
  suspendOutletUser,
  unSuspendOutletUser,
} from "./outlet.controller";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
  server.put(`${subBase}/:id/unlink`, unlinkOutlet);
  server.put(`${subBase}/:id/suspend`, suspendOutletUser);
  server.put(`${subBase}/:id/unsuspend`, unSuspendOutletUser);
  server.get(`${subBase}`, fetchOutlets);
};

export default outlet;

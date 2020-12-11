import {
  linkOutlet,
  unlinkOutlet,
  verifyLinkedOutlet,
  fetchOutlets,
} from "./outlet.controller.js";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.put(`${subBase}/:id/unlink`, unlinkOutlet);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
  server.get(`${subBase}`, fetchOutlets);
};

export default outlet;

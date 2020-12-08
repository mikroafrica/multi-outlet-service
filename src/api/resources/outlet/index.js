import {
  linkOutlet,
  verifyLinkedOutlet,
  fetchOutlets,
} from "./outlet.controller.js";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
  server.get(`${subBase}`, fetchOutlets);
};

export default outlet;

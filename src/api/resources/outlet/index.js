import {
  linkOutlet,
  verifyLinkOutlet,
  fetchOutlets,
} from "./outlet.controller.js";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/verify`, verifyLinkOutlet);
  server.get(`${subBase}`, fetchOutlets);
};

export default outlet;

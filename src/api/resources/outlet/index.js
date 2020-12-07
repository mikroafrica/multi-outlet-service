import { linkOutlet, verifyLinkOutlet } from "./outlet.controller.js";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/verify`, verifyLinkOutlet);
};

export default outlet;

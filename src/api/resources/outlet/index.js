import { linkOutlet, verifyLinkedOutlet } from "./outlet.controller.js";

const outlet = ({ server, subBase }) => {
  server.post(`${subBase}/link`, linkOutlet);
  server.post(`${subBase}/verify`, verifyLinkedOutlet);
};

export default outlet;

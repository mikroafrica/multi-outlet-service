import { locationLgaByState, locationState } from "./location.controller";

const location = ({ server, subBase }) => {
  server.get(`${subBase}`, locationState);
  server.get(`${subBase}/:state`, locationLgaByState);
};

export default location;

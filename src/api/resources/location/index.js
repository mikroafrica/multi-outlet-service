import {
  locationLgaByState,
  locationState,
  fetchRegion,
} from "./location.controller";

const location = ({ server, subBase }) => {
  server.get(`${subBase}`, locationState);
  server.get(`${subBase}/:state`, locationLgaByState);
  server.get(`${subBase}/:state/region`, fetchRegion);
};

export default location;

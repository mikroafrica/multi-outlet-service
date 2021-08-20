import {
  transferToDestination,
  lookUpAccount,
  fetchServiceFee,
  fetchSupportedBanks,
} from "./transfer.controller";

const transfer = ({ server, subBase }) => {
  server.post(`${subBase}/:id`, transferToDestination);
  server.post(`${subBase}/validate`, lookUpAccount);
  server.post(`${subBase}/:type/fee`, fetchServiceFee);
  server.get(`${subBase}/banks`, fetchSupportedBanks);
};

export default transfer;

import { transferToOutletOwner } from "./transfer.controller";

const transfer = ({ server, subBase }) => {
  server.get(`${subBase}/:id/send-to-owner`, transferToOutletOwner);
  server.get(`${subBase}/:id/send-to-outlet`, transferToOutletOwner);
};

export default transfer;

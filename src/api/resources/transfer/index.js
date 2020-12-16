import { transferToOutlet, transferToOutletOwner } from "./transfer.controller";

const transfer = ({ server, subBase }) => {
  server.post(`${subBase}/:id/outlet-to-admin`, transferToOutletOwner);
  server.post(`${subBase}/:id/admin-to-outlet`, transferToOutlet);
};

export default transfer;

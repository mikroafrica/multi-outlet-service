import { transferToOutlet, transferAcrossWallets } from "./transfer.controller";

const transfer = ({ server, subBase }) => {
  server.post(`${subBase}/:id/:destination`, transferAcrossWallets);
  // server.post(`${subBase}/:id/admin-to-outlet`, transferToOutlet);
};

export default transfer;

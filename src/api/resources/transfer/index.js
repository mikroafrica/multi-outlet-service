import { transferAcrossWallets } from "./transfer.controller";

const transfer = ({ server, subBase }) => {
  server.post(`${subBase}/:id/:destination`, transferAcrossWallets);
};

export default transfer;

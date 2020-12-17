import { walletTransfer, transferToOutletWallet } from "./transfer.service";

export const transferAcrossWallets = (req, res) => {
  const ownerId = req.user.userId;
  const outletId = req.params.id;
  const destination = req.params.destination;
  const params = req.body;

  walletTransfer({ ownerId, outletId, params, destination })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const transferToOutlet = (req, res) => {
  const ownerId = req.user.userId;
  const outletId = req.params.id;

  transferToOutletWallet({ ownerId, outletId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

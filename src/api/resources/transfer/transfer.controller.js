import {
  transferToOutletOwnerWallet,
  transferToOutletWallet,
} from "./transfer.service";

export const transferToOutletOwner = (req, res) => {
  const ownerId = req.user.userId;
  const outletId = req.params.id;
  const params = req.body;

  transferToOutletOwnerWallet({ ownerId, outletId, params })
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

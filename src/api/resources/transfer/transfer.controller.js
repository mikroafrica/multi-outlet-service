import {
  transfer,
  validateAccountNumber,
  getServiceFee,
  fetchBanks,
} from "./transfer.service";

export const transferToDestination = (req, res) => {
  const ownerId = req.user.userId;
  const params = req.body;

  transfer({ ownerId, params })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const lookUpAccount = (req, res) => {
  const params = req.body;

  validateAccountNumber({ params })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch((e) => {
      res.send(e.statusCode, { status: false, message: e.message });
    });
};

export const fetchServiceFee = (req, res) => {
  const params = req.body;
  const type = req.params.type;

  getServiceFee({ params, type })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch((e) => {
      res.send(e.statusCode, { status: false, message: e.message });
    });
};

export const fetchSupportedBanks = (req, res) => {
  fetchBanks()
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch((e) => {
      res.send(e.statusCode, { status: false, message: e.message });
    });
};

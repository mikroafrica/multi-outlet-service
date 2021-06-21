import {
  createCommission,
  getOwnerCommissionBalance,
  getOwnerCommissionSettings,
  updateOwnerCommissionSettings,
  getOwnerTransferCommissions,
} from "./commission.service";

export const createCommissionForOwner = (req, res) => {
  const params = req.body;
  // const ownerId = req.params.ownerId;

  createCommission({
    params,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const ownerCommissionBalance = (req, res) => {
  const ownerId = req.params.ownerId;

  getOwnerCommissionBalance({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const ownerCommissionSettings = (req, res) => {
  const ownerId = req.params.ownerId;

  getOwnerCommissionSettings({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const updateCommissionSetting = (req, res) => {
  const params = req.body;
  const id = req.params.id;

  updateOwnerCommissionSettings({ params, id })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const fetchOwnerTransferCommissions = (req, res) => {
  const ownerId = req.params.ownerId;

  getOwnerTransferCommissions({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

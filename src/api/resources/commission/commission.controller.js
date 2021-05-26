import {
  createCommission,
  getOwnerApprovalStatus,
  getOwnerCommissionBalance,
  getOwnerCommissionSettings,
  updateOwnerCommissionSettings,
} from "./commission.service";

export const createCommissionForOwner = (req, res) => {
  const params = req.body;
  const ownerId = req.params.id;

  createCommission({
    params,
    ownerId,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const ownerApprovalStatus = (req, res) => {
  const userId = req.params.id;

  getOwnerApprovalStatus({ userId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const ownerCommissionBalance = (req, res) => {
  const userId = req.params.id;
  // const commissiontype = req.query.commissiontype;

  getOwnerCommissionBalance({ userId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const ownerCommissionSettings = (req, res) => {
  // const commissiontype = req.query.commissiontype;
  const ownerId = req.params.id;

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
  const ownerId = req.params.id;
  const commissionId = req.params.commissionId;

  updateOwnerCommissionSettings({ params, commissionId, ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

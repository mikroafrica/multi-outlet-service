import {
  createCommission,
  getPartnerApprovalStatus,
  getPartnerCommissionBalance,
  getPartnerCommissionSettings,
  updatePartnerCommissionSettings,
} from "./commission.service";

export const createCommissionForPartner = (req, res) => {
  const params = req.body;
  const ownerId = req.params.id;
  const commissiontype = req.query.commissiontype;
  const transaction = req.query.transaction;
  const withdrawallevel = req.query.withdrawallevel;

  createCommission({
    params,
    ownerId,
    commissiontype,
    transaction,
    withdrawallevel,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const partnerApprovalStatus = (req, res) => {
  const userId = req.params.id;

  getPartnerApprovalStatus({ userId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const partnerCommissionBalance = (req, res) => {
  const userId = req.params.id;
  // const commissiontype = req.query.commissiontype;

  getPartnerCommissionBalance({ userId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const partnerCommissionSettings = (req, res) => {
  // const commissiontype = req.query.commissiontype;
  const ownerId = req.params.id;

  getPartnerCommissionSettings({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const updateCommissionSettings = (req, res) => {
  const params = req.body;
  const ownerId = req.params.id;
  const commissionId = req.params.commissionId;

  updatePartnerCommissionSettings({ params, commissionId, ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

import {
  linkOwnerToOutlet,
  linkOutletWithoutVerification,
  verifyOutletLinking,
  getOutlets,
  unlinkOutletFromOwner,
  switchOutletSuspendedStatus,
  getOutletByUserId,
  fetchCreatedBankAccounts,
  createPersonalBankAccount,
} from "./outlet.service";

export const linkOutlet = (req, res) => {
  const params = req.body;
  const ownerId = req.user.userId;

  linkOwnerToOutlet({ params, ownerId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const linkOutletToOwner = (req, res) => {
  const params = req.body;
  const ownerId = req.params.id;

  linkOutletWithoutVerification({ params, ownerId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const verifyLinkedOutlet = (req, res) => {
  const params = req.body;

  verifyOutletLinking({ params })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const unlinkOutlet = (req, res) => {
  const ownerId = req.user.userId;
  const outletUserId = req.params.id;

  unlinkOutletFromOwner({ ownerId, outletUserId })
    .then(({ statusCode }) => {
      res.send(statusCode, { status: true });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const unlinkSavedOutlet = (req, res) => {
  const ownerId = req.params.userId;
  const outletUserId = req.params.id;

  unlinkOutletFromOwner({ ownerId, outletUserId })
    .then(({ statusCode }) => {
      res.send(statusCode, { status: true });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const switchOutletStatus = (req, res) => {
  const outletUserId = req.params.id;
  const ownerId = req.user.userId;
  const status = req.params.status;

  switchOutletSuspendedStatus({ outletUserId, ownerId, status })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const fetchOutlets = (req, res) => {
  const ownerId = req.user.userId;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  getOutlets({ ownerId, page, limit })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const fetchOutletById = (req, res) => {
  const userId = req.params.id;

  getOutletByUserId({ userId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const fetchBankAccounts = (req, res) => {
  const userId = req.user.userId;

  fetchCreatedBankAccounts({ userId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const createBankAccount = (req, res) => {
  const userId = req.user.userId;
  const params = req.body;

  createPersonalBankAccount({ userId, params })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

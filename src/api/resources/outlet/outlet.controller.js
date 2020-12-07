import {
  linkOwnerToOutlet,
  verifyOutletLinking,
  getOutlets,
} from "./outlet.service.js";

export const linkOutlet = (req, res) => {
  const params = req.body;
  const userId = req.user.userId;

  linkOwnerToOutlet({ params, userId })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const verifyLinkOutlet = (req, res) => {
  const params = req.body;

  verifyOutletLinking({ params })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const fetchOutlets = (req, res) => {
  const userId = req.query.userId;

  const page = parseInt(req.query.page, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;

  getOutlets({ userId, page, limit })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

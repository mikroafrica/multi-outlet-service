import { linkOwnerToOutlet, verifyOutletLinking } from "./outlet.service.js";

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

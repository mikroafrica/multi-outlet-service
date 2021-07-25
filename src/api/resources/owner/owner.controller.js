import {
  updateUser,
  getUser,
  getUsers,
  getOwnerWithOutlets,
  getUserTickets,
} from "./owner.service.js";
import {
  generateReferralCodeByOwner,
  getAllReferredUsers,
} from "./owner.service";

export const updateUserProfile = (req, res) => {
  const params = req.body;
  const ownerId = req.user.userId;

  updateUser({ params, ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getMyAccount = (req, res) => {
  const ownerId = req.user.userId;

  getUser({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const fetchUsersByType = (req, res) => {
  const usertype = req.query.userType;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  getUsers({ usertype, page, limit })
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch(({ statusCode, message }) => {
      res.send(statusCode, { status: false, message });
    });
};

export const fetchOwnerById = (req, res) => {
  const ownerId = req.params.id;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  getOwnerWithOutlets({ ownerId, page, limit })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const fetchTicketsForUsers = (req, res) => {
  const userId = req.user.userId;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { dateTo, dateFrom, status, category } = req.query;

  getUserTickets({ userId, page, limit, dateTo, dateFrom, status, category })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const generateAccessCode = (req, res) => {
  const userId = req.user.userId;
  const numberOfCodeGen = req.body.numberOfCodeGen || 1;

  generateReferralCodeByOwner({ userId, numberOfCodeGen })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getReferredUsers = (req, res) => {
  const userId = req.user.userId;
  const { dateTo, dateFrom, mapped, status, phoneNumber } = req.query;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  getAllReferredUsers({
    userId,
    dateTo,
    dateFrom,
    mapped,
    status,
    page,
    limit,
    phoneNumber,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

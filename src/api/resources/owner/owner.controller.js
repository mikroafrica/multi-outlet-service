import {
  signupMultiOutletOwner,
  loginMultiOutletOwner,
  sendVerificationEmail,
  validateEmail,
  changePassword,
  requestResetPassword,
  resetPassword,
  updateUser,
  getUser,
  getUsers,
  createCommission,
  getPartnerCommissions,
  generateReferralCodeForUsers,
} from "./owner.service.js";
import { getOutlets } from "../outlet/outlet.service";

export const signup = (req, res) => {
  const params = req.body;

  signupMultiOutletOwner(params)
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const login = (req, res) => {
  const params = req.body;
  loginMultiOutletOwner({ params })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message, data }) =>
      res.send(statusCode, { status: false, message, data })
    );
};

export const resendVerificationEmail = (req, res) => {
  const params = req.body;

  sendVerificationEmail(params.userId)
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const validateVerificationEmail = (req, res) => {
  const params = req.body;

  validateEmail(params)
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const resetPasswordRequest = (req, res) => {
  const params = req.body;

  requestResetPassword({ params })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const resetMultiOutletOwnerPassword = (req, res) => {
  const params = req.body;

  resetPassword({ params })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const changePasswordRequest = (req, res) => {
  const ownerId = req.user.userId;
  const params = req.body;

  changePassword({ params, ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

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

export const fetchOwnerDetails = (req, res) => {
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
  const usertype = req.query.usertype;

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

export const createCommissionForPartner = (req, res) => {
  // const ownerId = req.user.userId;
  const params = req.body;
  const ownerId = req.query.id;
  const commissiontype = req.query.commissiontype;
  const transaction = req.query.transaction;
  const withdrawallevel = req.query.withdrawallevel;
  console.log("withdrawallevel", withdrawallevel);

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

export const fetchCommissionForPartner = (req, res) => {
  const userId = req.params.id;
  const commissiontype = req.query.commissiontype;
  // const commissionId = req.query.commissionId;

  getPartnerCommissions({ userId, commissiontype })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const usersOnboarding = (req, res) => {
  const ownerId = req.user.userId;

  generateReferralCodeForUsers({ ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

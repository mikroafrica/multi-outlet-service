import {
  signupMultiOutletOwner,
  sendVerificationEmail,
  validateEmail,
  changePassword,
  requestResetPassword,
  resetPassword,
  updateUser,
} from "./user.service.js";
import { loginMultiOutletOwner } from "./user.service.js";

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

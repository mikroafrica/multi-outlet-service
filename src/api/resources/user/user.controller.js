import {
  signupMultiOutletOwner,
  sendVerificationEmail,
  validateEmail,
  changePassword,
  requestResetPassword,
  resetPassword,
  validateResetPasswordOtp,
} from "./user.service.js";
import { loginMultiOutletOwner } from "./user.service.js";

export const signup = (req, res) => {
  const params = req.body;

  signupMultiOutletOwner(params)
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const login = (req, res) => {
  const params = req.body;
  loginMultiOutletOwner({ params })
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const resendVerificationEmail = (req, res) => {
  const params = req.body;

  sendVerificationEmail(params.userId)
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const validateVerificationEmail = (req, res) => {
  const params = req.body;

  validateEmail(params)
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const resetPasswordRequest = (req, res) => {
  const params = req.body;

  requestResetPassword({ params })
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const validateResetPassword = (req, res) => {
  const params = req.body;

  validateResetPasswordOtp({ params })
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const resetMultiOutletOwnerPassword = (req, res) => {
  const params = req.body;

  resetPassword({ params })
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

export const changePasswordRequest = (req, res) => {
  const params = req.body;

  changePassword({ params })
    .then((data) => res.send(data))
    .catch((error) => res.send(error));
};

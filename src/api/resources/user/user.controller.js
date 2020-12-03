import {
  signupMultiOutletOwner,
  sendVerificationEmail,
  validateEmail,
} from "./user.service.js";
import { OK } from "../../modules/status.js";
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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.changePasswordRequest = exports.resetMultiOutletOwnerPassword = exports.resetPasswordRequest = exports.validateVerificationEmail = exports.resendVerificationEmail = exports.login = exports.signup = void 0;

var _userService = require("./user.service.js");

const signup = (req, res) => {
  const params = req.body;
  (0, _userService.signupMultiOutletOwner)(params)
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, {
        status: false,
        message,
      })
    );
};

exports.signup = signup;

const login = (req, res) => {
  const params = req.body;
  (0, _userService.loginMultiOutletOwner)({
    params,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message, data }) =>
      res.send(statusCode, {
        status: false,
        message,
        data,
      })
    );
};

exports.login = login;

const resendVerificationEmail = (req, res) => {
  const params = req.body;
  (0, _userService.sendVerificationEmail)(params.userId)
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, {
        status: false,
        message,
      })
    );
};

exports.resendVerificationEmail = resendVerificationEmail;

const validateVerificationEmail = (req, res) => {
  const params = req.body;
  (0, _userService.validateEmail)(params)
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, {
        status: false,
        message,
      })
    );
};

exports.validateVerificationEmail = validateVerificationEmail;

const resetPasswordRequest = (req, res) => {
  const params = req.body;
  (0, _userService.requestResetPassword)({
    params,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, {
        status: false,
        message,
      })
    );
};

exports.resetPasswordRequest = resetPasswordRequest;

const resetMultiOutletOwnerPassword = (req, res) => {
  const params = req.body;
  (0, _userService.resetPassword)({
    params,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, {
        status: false,
        message,
      })
    );
};

exports.resetMultiOutletOwnerPassword = resetMultiOutletOwnerPassword;

const changePasswordRequest = (req, res) => {
  const params = req.body;
  (0, _userService.changePassword)({
    params,
  })
    .then(({ statusCode, data }) =>
      res.send(statusCode, {
        status: true,
        data,
      })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, {
        status: false,
        message,
      })
    );
};

exports.changePasswordRequest = changePasswordRequest;

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _userController = require("./user.controller.js");

const auth = ({ server, subBase }) => {
  server.post(`${subBase}/signup`, _userController.signup);
  server.post(`${subBase}/login`, _userController.login);
  server.post(
    `${subBase}/email-verification`,
    _userController.resendVerificationEmail
  );
  server.post(
    `${subBase}/email-validation`,
    _userController.validateVerificationEmail
  );
  server.post(
    `${subBase}/reset-password-request`,
    _userController.resetPasswordRequest
  );
  server.put(
    `${subBase}/reset-password`,
    _userController.resetMultiOutletOwnerPassword
  );
  server.put(
    `${subBase}/change-password`,
    _userController.changePasswordRequest
  );
};

var _default = auth;
exports.default = _default;

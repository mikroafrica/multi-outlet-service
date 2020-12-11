"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changePassword = exports.resetPassword = exports.resetPasswordRequest = exports.login = exports.signup = void 0;

var _restifyClients = _interopRequireDefault(require("restify-clients"));

var _request = require("./request");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const restifyRequest = function () {
  const restifyClient = _restifyClients.default.createJSONClient({
    url: process.env.AUTH_SERVICE_URL,
    version: "*"
  });

  restifyClient.basicAuth(process.env.AUTH_SERVICE_USERNAME, process.env.AUTH_SERVICE_PASSWORD);
  return restifyClient;
};

const signup = params => {
  const client = restifyRequest();
  const path = "/auth/create";
  return (0, _request.post)({
    client,
    path,
    params
  });
};

exports.signup = signup;

const login = params => {
  const client = restifyRequest();
  const path = "/auth/login";
  return (0, _request.post)({
    client,
    path,
    params
  });
};

exports.login = login;

const resetPasswordRequest = params => {
  params.source = "web";
  const client = restifyRequest();
  const path = "/password/reset-request";
  return (0, _request.post)({
    client,
    path,
    params
  });
};

exports.resetPasswordRequest = resetPasswordRequest;

const resetPassword = params => {
  const client = restifyRequest();
  const path = "/password/reset-password-web";
  return (0, _request.put)({
    client,
    path,
    params
  });
};

exports.resetPassword = resetPassword;

const changePassword = params => {
  const client = restifyRequest();
  const path = "/password/change";
  return (0, _request.put)({
    client,
    path,
    params
  });
};

exports.changePassword = changePassword;
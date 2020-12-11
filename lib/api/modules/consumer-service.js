"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateVerificationOtp = exports.requestVerificationEmail = exports.getUserDetails = exports.deleteUserAccount = exports.signup = void 0;

var _restifyClients = _interopRequireDefault(require("restify-clients"));

var _request = require("./request.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const restifyRequest = function () {
  const restifyClient = _restifyClients.default.createJSONClient({
    url: process.env.CONSUMER_SERVICE_URL,
    version: "*"
  });

  restifyClient.basicAuth(process.env.CONSUMER_SERVICE_USERNAME, process.env.CONSUMER_SERVICE_PASSWORD);
  return restifyClient;
};

const signup = params => {
  const client = restifyRequest();
  const path = "/user/create/OUTLET_OWNER";
  return (0, _request.post)({
    client,
    path,
    params
  });
};

exports.signup = signup;

const deleteUserAccount = userId => {
  const client = restifyRequest();
  const path = `/user/${userId}/recreate-web`;
  const params = {};
  return (0, _request.put)({
    client,
    path,
    params
  });
};

exports.deleteUserAccount = deleteUserAccount;

const getUserDetails = async userId => {
  const client = restifyRequest();
  const path = `/user/${userId}/details`;
  return await (0, _request.get)({
    client,
    path
  });
};

exports.getUserDetails = getUserDetails;

const requestVerificationEmail = params => {
  const client = restifyRequest();
  const path = "/user/email-verification";
  return (0, _request.post)({
    client,
    path,
    params
  });
};

exports.requestVerificationEmail = requestVerificationEmail;

const validateVerificationOtp = params => {
  const client = restifyRequest();
  const path = "/user/email-validation";
  return (0, _request.post)({
    client,
    path,
    params
  });
};

exports.validateVerificationOtp = validateVerificationOtp;
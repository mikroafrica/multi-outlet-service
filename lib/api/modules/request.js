"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.put = exports.get = exports.post = void 0;

var _logger = _interopRequireDefault(require(".././../logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const post = ({
  client,
  path,
  params
}) => {
  return new Promise((resolve, reject) => {
    client.post(path, params, function (err, req, res, data) {
      if (err) {
        _logger.default.error(`Error while making post request: ${err}`);

        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.post = post;

const get = ({
  client,
  path
}) => {
  return new Promise((resolve, reject) => {
    client.get(path, function (err, req, res, data) {
      if (err) {
        _logger.default.error(`Error while making get request: ${err}`);

        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.get = get;

const put = ({
  client,
  path,
  params
}) => {
  return new Promise((resolve, reject) => {
    client.put(path, params, function (err, req, res, data) {
      if (err) {
        _logger.default.error(`Error while making put request: ${err}`);

        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.put = put;
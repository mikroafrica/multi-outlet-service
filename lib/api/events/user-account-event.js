"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _index = require("./index.js");

var _consumerService = require("../modules/consumer-service.js");

var _logger = _interopRequireDefault(require("../../logger.js"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const Emitter = _events.default.EventEmitter;
const userAccountEmitter = new Emitter();
userAccountEmitter.on(_index.CLEAR_ACCOUNT_EVENT, function (userId) {
  (0, _consumerService.deleteUserAccount)(userId)
    .then((data) => {
      _logger.default.info(`Deleted user with [${JSON.stringify(data)}]`);
    })
    .catch((err) => {
      _logger.default.error(
        `User with userId [${userId}] failed to be deleted with error ${JSON.stringify(
          err
        )} `
      );
    });
});
userAccountEmitter.on(_index.ERROR_EVENT, function (value) {
  _logger.default.error(`event failed with error ${JSON.stringify(value)}`);
});
var _default = userAccountEmitter;
exports.default = _default;

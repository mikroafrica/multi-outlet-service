"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _winston = _interopRequireDefault(require("winston"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// import {createLogger, format, transports} from 'winston';
const { createLogger, format, transports } = _winston.default;
const { cli } = format;
const logger = createLogger({
  level: "info",
  format: cli(),
  transports: [new transports.Console()],
});
var _default = logger;
exports.default = _default;

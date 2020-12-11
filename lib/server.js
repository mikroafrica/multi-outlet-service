"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _restify = _interopRequireDefault(require("restify"));

var _middleware = require("./api/middleware.js");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _db = require("./db.js");

var _index = _interopRequireDefault(require("./api/resources/user/index.js"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const server = _restify.default.createServer({
  name: "mk-multi-outlet-service",
});

server.use(_restify.default.plugins.acceptParser(server.acceptable));
server.use(_restify.default.plugins.queryParser());
server.use(_restify.default.plugins.bodyParser());
server.use(
  _restify.default.plugins.conditionalHandler({
    handler: _middleware.secureRoute,
  })
);

_dotenv.default.config();

(0, _db.connect)();
(0, _index.default)({
  server: server,
  subBase: "/auth",
});
var _default = server;
exports.default = _default;

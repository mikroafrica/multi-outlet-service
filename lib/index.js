"use strict";

var _server = _interopRequireDefault(require("./server.js"));

var _logger = _interopRequireDefault(require("./logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on("uncaughtException", function (err) {
  _logger.default.error(`uncaught error has been fired with Error: ${err}`);
});
const port = process.env.PORT || 4000;

_server.default.listen(port, () => {
  _logger.default.info(`App running @ port ${port}`);
});
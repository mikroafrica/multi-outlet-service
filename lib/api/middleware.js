"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.secureRoute = void 0;

const secureRoute = (req, res, next) => {
  return next();
};

exports.secureRoute = secureRoute;

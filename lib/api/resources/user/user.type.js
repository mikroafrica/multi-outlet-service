"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserStatus = exports.UserType = void 0;
const UserType = {
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales"
};
exports.UserType = UserType;
const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED"
};
exports.UserStatus = UserStatus;
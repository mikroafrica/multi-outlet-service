import { UN_AUTHORISED } from "./modules/status.js";
import * as AuthService from "../api/modules/auth-service.js";
import logger from "../logger.js";
import basicAuth from "basic-auth";
import { validateToken } from "./modules/auth-service";
import compare from "tsscmp";

const checkAccess = (name: string, password: string): Boolean => {
  let valid: Boolean = true;

  // prevent short-cricuit and use timing-safe compare
  valid = compare(name, process.env.AUTH_SERVICE_USERNAME) && valid;
  valid = compare(password, process.env.AUTH_SERVICE_PASSWORD) && valid;
  return valid;
};

export const secureRoute = (req, res, next) => {
  const credentials = basicAuth(req);

  const path = req.route.path;
  const method = req.method;

  if (Object.is(method, "GET") && path === "/") {
    return next();
  }

  // check against account credentials stored
  if (!credentials || !checkAccess(credentials.name, credentials.pass)) {
    logger.info(`Route is not authorized`);
    return res.send(UN_AUTHORISED, {
      status: false,
      message: "UnAuthorized",
    });
  }

  if (allowRoutes(req)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.split(" ").length < 2) {
    logger.error(`Token wasn't supplied`);
    return res.send(UN_AUTHORISED, {
      status: false,
      message: "Authorization is required",
    });
  }

  const token = authHeader.split(" ")[1];
  const params = { token };
  AuthService.validateToken(params)
    .then((authResponse) => {
      const authResponseData = authResponse.data;
      req.user = authResponseData.data;
      return next();
    })
    .catch((err) => {
      logger.error(
        `failed to validate token with error ${JSON.stringify(err)}`
      );
      return res.send(err.statusCode || UN_AUTHORISED, {
        status: false,
        message: err.message || "Your session has expired",
      });
    });
};

const allowRoutes = (req) => {
  const path = req.route.path;
  const method = req.method;

  if (Object.is(method, "GET") && path === "/") {
    return true;
  }

  const routes = [
    "login",
    "signup",
    "reset-password",
    "email-validation",
    "email-verification",
    "reset-password-request",
    "users",
    "commissions",
    "user/:id",
    "link-outlet/:id",
    "/:id",
    "commission-setting/:id",
  ];
  for (let i = 0; i < routes.length; i++) {
    if (path.includes(routes[i])) {
      return true;
    }
  }
  return false;
};

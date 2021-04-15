import { UN_AUTHORISED } from "./modules/status.js";
import * as AuthService from "../api/modules/auth-service.js";
import logger from "../logger.js";

export const secureRoute = (req, res, next) => {
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
    "metrics",
    "reset-password",
    "email-validation",
    "email-verification",
    "reset-password-request",
  ];
  for (let i = 0; i < routes.length; i++) {
    if (path.includes(routes[i])) {
      return true;
    }
  }
  return false;
};

import { UN_AUTHORISED } from "./modules/status.js";
import * as AuthService from "../../src/api/modules/auth-service.js";
import logger from "../logger.js";

export const secureRoute = (req, res, next) => {
  const path = req.route.path;

  if (path.includes("auth")) {
    return next();
  }

  const token = req.headers.accessToken || req.headers.accesstoken;

  if (!token) {
    logger.error(`valid bearer token is not provided`);
    return res.send(UN_AUTHORISED, {
      status: false,
      message:
        "Session expired. Please login again with your valid credentials",
    });
  }

  const params = { token };
  AuthService.validateToken(params)
    .then((authResponse) => {
      req.user = authResponse.data;
      return next();
    })
    .catch((err) => {
      console.log(err);
      logger.error(
        `failed to validate token with error ${JSON.stringify(err)}`
      );
      return res.send(err.statusCode || UN_AUTHORISED, {
        status: false,
        message: err.message || "Your session has expired",
      });
    });
};

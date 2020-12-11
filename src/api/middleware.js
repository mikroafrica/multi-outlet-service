import { UN_AUTHORISED } from "./modules/status.js";
import * as AuthService from "../../src/api/modules/auth-service.js";
import logger from "../logger.js";

export const secureRoute = (req, res, next) => {
  const path = req.route.path;

  if (path.includes("auth") && !path.includes("update-profile")) {
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
      req.user = authResponse.data;
      return next();
    })
    .catch((err) => {
      logger.error(
        `failed to validate token with error ${JSON.stringify(err)}`
      );
      return res.send(err.statusCode || UN_AUTHORISED, {
        status: false,
        message: JSON.parse(err.message).message || "Your session has expired",
      });
    });
};

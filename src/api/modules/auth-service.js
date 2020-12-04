import restify from "restify-clients";
import { post, put } from "./request.js";

const restifyRequest = function () {
  const restifyClient = restify.createJSONClient({
    url: process.env.AUTH_SERVICE_URL,
    version: "*",
  });

  restifyClient.basicAuth(
    process.env.AUTH_SERVICE_USERNAME,
    process.env.AUTH_SERVICE_PASSWORD
  );
  return restifyClient;
};

export const signup = (params) => {
  const client = restifyRequest();
  const path = "/auth/create";

  return post({ client, path, params });
};

export const login = (params) => {
  const client = restifyRequest();
  const path = "/auth/login";

  return post({ client, path, params });
};

export const resetPasswordRequest = (params) => {
  params.source = "web";
  const client = restifyRequest();
  const path = "/password/reset-request";

  return post({ client, path, params });
};

export const resetPassword = (params) => {
  const client = restifyRequest();
  const path = "/password/reset-password-web";

  return put({ client, path, params });
};

export const changePassword = (params) => {
  const client = restifyRequest();
  const path = "/password/change";

  return put({ client, path, params });
};

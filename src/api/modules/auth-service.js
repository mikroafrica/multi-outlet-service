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

export const signup = async (params) => {
  const client = restifyRequest();

  const path = {
    path: "/auth/create",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return post({ client, path, params });
};

export const login = async (params) => {
  const client = restifyRequest();
  const path = {
    path: "/auth/login",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return await post({ client, path, params });
};

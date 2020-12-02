import restify from "restify-clients";
import { post, put } from "./request.js";

const restifyRequest = function () {
  const restifyClient = restify.createJSONClient({
    url: process.env.CONSUMER_SERVICE_URL,
    version: "*",
  });

  restifyClient.basicAuth(
    process.env.CONSUMER_SERVICE_USERNAME,
    process.env.CONSUMER_SERVICE_PASSWORD
  );

  return restifyClient;
};

export const signup = async (params) => {
  const client = restifyRequest();

  const path = {
    path: "/user/create/OUTLET_OWNER",
  };

  return post({ client, path, params });
};

export const requestVerificationEmail = async (params) => {
  const client = restifyRequest();

  const path = {
    path: "/user/email-verification",

    headers: {
      "Content-Type": "application/json",
    },
  };

  return post({ client, path, params });
};

export const validateVerificationOtp = async (params) => {
  const client = restifyRequest();

  const path = {
    path: "/user/email-validation",

    headers: {
      "Content-Type": "application/json",
    },
  };

  return post({ client, path, params });
};

import restify from "restify-clients";
import { get, post } from "./request";

const restifyClient = () => {
  const restifyClient = restify.createJSONClient({
    url: process.env.PAYMENT_SERVICE_URL,
    version: "*",
  });

  restifyClient.basicAuth(
    process.env.PAYMENT_SERVICE_USERNAME,
    process.env.PAYMENT_SERVICE_PASSWORD
  );
  return restifyClient;
};

export const accountNumberLookUp = (params) => {
  const client = restifyClient();
  return post({ client, path: "/validate", params });
};

export const banks = () => {
  const client = restifyClient();
  return get({ client, path: "/banks" });
};

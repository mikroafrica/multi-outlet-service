import restify from "restify-clients";
import { get, post, put } from "./request";

const restifyClient = () => {
  const restifyClient = restify.createJSONClient({
    url: process.env.PAYMENT_SERVICE_URL,
    version: "*",
  });

  restifyClient.basicAuth(
    process.env.PAYMENT_SERVICE_USERNAME,
    process.env.PAYMENT_SERVIC_PASSWORD
  );
  return restifyClient;
};

export const accountNumberLookUp = (params) => {
  const client = restifyClient();
  return post({ client, path: "/validate", params });
};

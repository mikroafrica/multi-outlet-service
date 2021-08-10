import restify from "restify-clients";
import { get } from "./request.js";

const restifyRequest = function () {
  const restifyClient = restify.createJSONClient({
    url: process.env.APP_SERVICE_URL,
    version: "*",
  });

  restifyClient.basicAuth(
    process.env.APP_SERVICE_USERNAME,
    process.env.APP_SERVICE_PASSWORD
  );
  return restifyClient;
};

export const locationState = () => {
  const client = restifyRequest();
  const path = "/location";

  return get({ client, path });
};

export const locationLgaByState = (state) => {
  const client = restifyRequest();
  const path = `/location/${state}`;

  return get({ client, path });
};

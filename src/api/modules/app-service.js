import restify from "restify-clients";
import { get, post } from "./request.js";

const restifyRequest = () => {
  const client = restify.createJSONClient({
    url: process.env.APP_SERVICE_URL,
    version: "*",
  });

  client.basicAuth(
    process.env.APP_SERVICE_USERNAME,
    process.env.APP_SERVICE_PASSWORD
  );
  return client;
};

export const getStates = () => {
  const client = restifyRequest();
  return get({
    client,
    path: "/location",
  });
};

export const getLocalGovt = ({ state }) => {
  const client = restifyRequest();
  return get({
    client,
    path: `/location/${state}`,
  });
};

export const getRegion = ({ state }) => {
  const client = restifyRequest();
  return get({
    client,
    path: `/location/${state}/region`,
  });
};

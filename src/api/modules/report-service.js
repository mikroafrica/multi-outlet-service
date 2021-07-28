import restify from "restify-clients";
import { get, post } from "./request.js";

const restifyRequest = () => {
  const client = restify.createJSONClient({
    url: process.env.REPORT_SERVICE_URL,
    version: "*",
  });

  client.basicAuth(
    process.env.REPORT_SERVICE_USERNAME,
    process.env.REPORT_SERVICE_PASSWORD
  );
  return client;
};

export const ReportIndex = {
  TRANSACTION: "mikro-transaction",
};

export const search = (query) => {
  const client = restifyRequest();
  return post({ client, params: query, path: "/report/raw" });
};

export type HitResponse = {
  total: any,
  max_score: number,
  hits: Hit[],
};

export type Hit = {
  _index: string,
  _type: string,
  _id: string,
  _score: string,
  _source: any,
};

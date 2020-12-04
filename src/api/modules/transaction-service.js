import restify from "restify-clients";
import { get } from "./request.js";

const restifyRequest = () => {
  const client = restify.createJSONClient({
    url: process.env.TRANSACTION_SERVICE_URL,
    version: "*",
  });

  client.basicAuth(
    process.env.TRANSACTION_SERVICE_USERNAME,
    process.env.TRANSACTION_SERVICE_PASSWORD
  );
  return client;
};

export const fetchTransactions = ({
  userId,
  dateFrom,
  dateTo,
  page,
  limit,
  status,
  type,
  customerBillerId,
}) => {
  const client = restifyRequest();

  const path = {
    path: `/transactions/${userId}`,
    query: {
      page,
      limit,
      dateFrom,
      dateTo,
      status,
      type,
      customerBillerId,
    },
  };
  return get({ client, path });
};

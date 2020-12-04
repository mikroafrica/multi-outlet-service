import restify from "restify-clients";
import { get } from "./request.js";

const restifyRequest = () => {
  const client = restify.createJSONClient({
    url: process.env.WALLET_SERVICE_URL,
    version: "*",
  });

  client.basicAuth(process.env.WALLET_USERNAME, process.env.WALLET_PASSWORD);
  return client;
};

export const fetchWalletSummaryById = (id) => {
  const client = restifyRequest();
  return get({ client, path: `/transactions/${id}/balance` });
};

export const fetchWalletTransactions = ({
  walletId,
  page,
  limit,
  dateFrom,
  dateTo,
  transactionType,
}) => {
  const client = restifyRequest();

  const path = {
    path: `/transactions/${walletId}`,
    query: {
      page,
      limit,
      dateFrom,
      dateTo,
      type: transactionType,
    },
  };
  return get({ client, path });
};

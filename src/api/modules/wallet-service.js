import restify from "restify-clients";
import { get } from "./request";

const request = () => {
  const client = restify.createJSONClient({
    url: process.env.WALLET_SERVICE_URL,
    version: "*",
  });

  client.basicAuth(process.env.WALLET_USERNAME, process.env.WALLET_PASSWORD);
  return client;
};

export const fetchWalletSummaryById = (id) => {
  return get({ client: request, path: `/transactions/${id}/balancee` });
};

export const fetchWalletTransactions = ({
  walletId,
  page,
  limit,
  dateFrom,
  dateTo,
  transactionType,
}) => {
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
  return get({ client: request, path });
};

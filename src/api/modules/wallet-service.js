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

export const getWalletById = (id) => {
  const client = restifyRequest();
  return get({ client, path: `/wallets/${id}` });
};

export const fetchWalletSummaryById = ({ walletId, dateFrom, dateTo }) => {
  const client = restifyRequest();
  const path = {
    path: `/transactions/${walletId}/balance`,
    query: {
      dateFrom,
      dateTo,
    },
  };
  return get({ client, path });
};

export const fetchWalletTransactions = ({
  page,
  limit,
  walletId,
  dateFrom,
  dateTo,
  transactionCategory,
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

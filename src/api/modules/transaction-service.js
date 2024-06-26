import restify from "restify-clients";
import { get, post } from "./request.js";

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

export const transactionsCategorySummary = ({ userId, dateFrom, dateTo }) => {
  const client = restifyRequest();

  const path = {
    path: `/transactions/category-summary`,
    query: {
      dateFrom,
      dateTo,
      userId,
    },
  };
  return get({ client, path });
};

export const transactionsCategorySummaryByUserIds = ({
  userIds,
  dateFrom,
  dateTo,
}) => {
  const client = restifyRequest();

  const path = {
    path: `/transactions/category-summary/multiple`,
    query: {
      dateFrom,
      dateTo,
    },
  };
  return post({ client, path, params: userIds });
};

export const transactionsByUserIds = ({
  userIds,
  dateFrom,
  dateTo,
  status,
  limit,
  page,
  type,
  customerBillerId,
}) => {
  const client = restifyRequest();

  const path = {
    path: `/transactions/multi/users`,
    query: {
      type,
      page,
      status,
      limit,
      dateTo,
      dateFrom,
      customerBillerId,
    },
  };
  return post({ client, path, params: userIds });
};

export const fetchTransactionSummary = ({ userId, dateFrom, dateTo }) => {
  const client = restifyRequest();

  const path = {
    path: `/transactions/summary`,
    query: {
      dateFrom,
      dateTo,
      userId,
    },
  };
  return get({ client, path });
};

export const creteTransaction = async (params) => {
  const client = restifyRequest();
  const path = `/transactions/create`;
  return post({ client, path, params });
};

export const fetchServiceFee = (params, type) => {
  const client = restifyRequest();
  const path = `/transactions/${type}/fee`;
  return post({ client, path, params });
};

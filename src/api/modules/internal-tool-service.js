import restify from "restify-clients";
import { get, post, put, getRequest } from "./request";

const restifyRequest = () => {
  const restifyClient = restify.createJSONClient({
    url: process.env.INTERNAL_TOOLS_URL,
    version: "*",
  });
  return restifyClient;
};

export const getTickets = ({
  dateFrom,
  dateTo,
  page,
  limit,
  status,
  category,
  userIdsList,
}) => {
  const client = restifyRequest();
  const path = {
    path: `/tickets/user/multi`,
    query: {
      page,
      limit,
      from: dateFrom,
      to: dateTo,
      status,
      category,
    },
  };
  return post({ client, path, params: userIdsList });
};

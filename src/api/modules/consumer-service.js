import restify from "restify-clients";
import { post, put, get } from "./request.js";

const restifyRequest = function () {
  const restifyClient = restify.createJSONClient({
    url: process.env.CONSUMER_SERVICE_URL,
    version: "*",
  });

  restifyClient.basicAuth(
    process.env.CONSUMER_SERVICE_USERNAME,
    process.env.CONSUMER_SERVICE_PASSWORD
  );

  return restifyClient;
};

export const signup = (params) => {
  const client = restifyRequest();
  const path = "/user/create/OUTLET_PARTNER";

  return post({ client, path, params });
};

export const deleteUserAccount = (userId) => {
  const client = restifyRequest();
  const path = `/user/${userId}/recreate-web`;
  const params = {};
  return put({ client, path, params });
};

export const getUserDetails = async (userId) => {
  const client = restifyRequest();
  const path = `/user/${userId}/details`;
  return await get({ client, path });
};

export const requestVerificationEmail = (params) => {
  const client = restifyRequest();
  const path = "/user/email-verification";

  return post({ client, path, params });
};

export const validateVerificationOtp = (params) => {
  const client = restifyRequest();
  const path = "/user/email-validation";

  return post({ client, path, params });
};

export const generateOtp = (params) => {
  const client = restifyRequest();
  return post({ client, path: "/otp", params });
};

export const validateUserOtp = ({ verificationId, otpCode }) => {
  const client = restifyRequest();
  return get({
    client,
    path: `/otp/${verificationId}/${otpCode}/validate`,
    params: {},
  });
};

export const updateUserProfile = ({ params, userId }) => {
  const client = restifyRequest();
  return put({ client, path: `/user/${userId}/profile`, params });
};

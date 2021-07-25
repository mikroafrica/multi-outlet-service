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

export const signup = (params, userType) => {
  const client = restifyRequest();
  const path = `/user/create/${userType}`;

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

export const getUserByPhoneNumber = async (phoneNumber) => {
  const client = restifyRequest();
  const path = {
    path: `/user/${phoneNumber}/`,
    query: {
      option: "phone",
    },
  };
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

export const getUsersByReferral = ({
  dateTo,
  dateFrom,
  mapped,
  status,
  page,
  limit,
  phoneNumber,
  referralId,
}) => {
  const client = restifyRequest();
  return get({
    client,
    path: `/referral/${referralId}/users`,
    query: {
      dateFrom,
      dateTo,
      mapped,
      status,
      page,
      limit,
      phoneNumber,
    },
  });
};

export const createReferral = ({ name, phoneNumber, zone, lga, state }) => {
  const params = { name, phoneNumber, zone, lga, state };
  const client = restifyRequest();
  return post({ client, path: "/referral/create", params });
};

export const generateReferralCode = ({ accessCode, numberOfCodeGen }) => {
  const params = { accessCode, numberOfCodeGen };
  const client = restifyRequest();
  return post({ client, path: "/referral/codegen", params });
};

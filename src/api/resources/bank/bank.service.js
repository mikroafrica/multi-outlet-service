import * as ConsumerService from "../../modules/consumer-service";
import { BAD_REQUEST, OK } from "../../modules/status";
import logger from "../../../logger";

export const fetchCreatedBankAccounts = ({ userId }) => {
  return ConsumerService.fetchPersonalBankAccount({ userId })
    .then((responseData) => {
      const accountResponseData = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: accountResponseData.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while fetching personal bank account with user id ${userId} with error ${JSON.stringify(
          err
        )}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

export const createPersonalBankAccount = ({ userId, params }) => {
  return ConsumerService.personalBankAccountCreation({ userId, params })
    .then((responseData) => {
      const accountResponseData = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: accountResponseData.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while creating personal bank account with user id ${userId} with error ${JSON.stringify(
          err
        )}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

import * as AppService from "../../modules/app-service";
import { OK } from "../../modules/status";
import logger from "../../../logger";

export const fetchAllStates = async () => {
  return AppService.locationState()
    .then((responseData) => {
      const statesResponseData = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: statesResponseData.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while fetching states with error ${JSON.stringify(err)}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

export const fetchLgaByState = async (state) => {
  return AppService.locationLgaByState(state)
    .then((responseData) => {
      const lgaResponseData = responseData.data;
      return Promise.resolve({
        statusCode: OK,
        data: lgaResponseData.data,
      });
    })
    .catch((err) => {
      logger.error(
        `Error occurred while fetching state lgas with error ${JSON.stringify(
          err
        )}`
      );
      return Promise.reject({
        statusCode: err.statusCode,
        message: err.message || "Something went wrong. Please try again",
      });
    });
};

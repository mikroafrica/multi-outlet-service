import Events from "events";
import { CLEAR_ACCOUNT_EVENT, ERROR_EVENT } from "./index.js";
import { deleteUserAccount } from "../modules/consumer-service.js";
import logger from "../../logger.js";

const Emitter = Events.EventEmitter;
const userAccountEmitter = new Emitter();

userAccountEmitter.on(CLEAR_ACCOUNT_EVENT, function (userId) {
  deleteUserAccount(userId)
    .then((data) => {
      logger.info(
        `Temp user is successfully re-created with data [${JSON.stringify(
          data
        )}]`
      );
    })
    .catch((err) => {
      logger.error(
        `Temp user with phone number [${phoneNumber}] and registration id [${registrationId}] failed to be created with error ${JSON.stringify(
          err
        )} `
      );
    });
});

userAccountEmitter.on(ERROR_EVENT, function (value) {
  logger.error(`event failed with error ${JSON.stringify(value)}`);
});

export default userAccountEmitter;

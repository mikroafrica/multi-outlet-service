import server from "./server.js";
import logger from "./logger.js";

// process.on("uncaughtException", function (err) {
//   logger.error(`uncaught error has been fired with Error: ${err}`);
// });
const port = process.env.PORT || 80;
server.listen(port, () => {
  logger.info(`App running @ port ${port}`);
});

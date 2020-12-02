import server from "./server.js";
import logger from "./logger.js";

process.on("uncaughtException", function (err) {
  logger.error(`uncaught error has been fired with Error: ${err}`);
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`App running on Port ${port}`);
});

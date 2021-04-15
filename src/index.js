import client from "prom-client";
import * as Prometheus from "./metrics";
import server from "./server.js";
import logger from "./logger.js";

server.use(Prometheus.requestCounters);
server.use(Prometheus.responseCounters);
server.use(Prometheus.hisResCounters);
Prometheus.metricsEndpoint(server);

process.on("uncaughtException", function (err) {
  logger.error(`uncaught error has been fired with Error: ${err}`);
});
const port = process.env.PORT || 4000;
server.listen(port, () => {
  logger.info(`App running @ port ${port}`);
});

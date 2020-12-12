import restify from "restify";
import { secureRoute } from "./api/middleware.js";
import dotenv from "dotenv";
import corsMiddleware from "restify-cors-middleware";
import { connect } from "./db.js";
import auth from "./api/resources/user/index.js";
import wallet from "./api/resources/wallet/index.js";
import transaction from "./api/resources/transaction/index.js";
import outlet from "./api/resources/outlet/index.js";

const server = restify.createServer({
  name: "mk-multi-outlet-service",
});

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ["*"],
  allowHeaders: ["X-App-Version"],
  exposeHeaders: [],
});
server.pre(cors.preflight);
server.use(cors.actual);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.use(
  restify.plugins.conditionalHandler({
    handler: secureRoute,
  })
);

dotenv.config();

connect();

auth({ server: server, subBase: "/auth" });
outlet({ server: server, subBase: "/outlet" });
wallet({ server: server, subBase: "/wallet" });
transaction({ server: server, subBase: "/transaction" });

export default server;

import restify from "restify";
import { secureRoute } from "./api/middleware";
import dotenv from "dotenv";
import corsMiddleware from "restify-cors-middleware";
import { connect } from "./db";
import auth from "./api/resources/owner";
import wallet from "./api/resources/wallet";
import transaction from "./api/resources/transaction";
import outlet from "./api/resources/outlet";
import transfer from "./api/resources/transfer";

const server = restify.createServer({
  name: "mk-multi-outlet-service",
});

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ["*"],
  allowHeaders: ["*"],
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
transfer({ server: server, subBase: "/transfer" });

export default server;

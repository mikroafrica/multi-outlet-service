import restify from "restify";
import { secureRoute } from "./api/middleware.js";
import dotenv from "dotenv";
import { connect } from "./db.js";
import auth from "./api/resources/user/index.js";
import wallet from "./api/resources/wallet/index.js";
import transaction from "./api/resources/transaction/index.js";
import outlet from "./api/resources/outlet/index.js";

const server = restify.createServer({
  name: "mk-multi-outlet-service",
});

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

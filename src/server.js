import restify from "restify";
import { secureRoute } from "./api/middleware";
import dotenv from "dotenv";
import corsMiddleware from "restify-cors-middleware";
import { connect } from "./db";
import auth from "./api/resources/auth";
import wallet from "./api/resources/wallet";
import transaction from "./api/resources/transaction";
import v1Transaction from "./api/resources/transaction/v1";
import outlet from "./api/resources/outlet";
import location from "./api/resources/location";
import transfer from "./api/resources/transfer";
import media from "./api/resources/media";
import commission from "./api/resources/commission";
import health from "./api/health";
import owner from "./api/resources/owner";

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

health({ server, subBase: "" });
auth({ server: server, subBase: "/auth" });
owner({ server: server, subBase: "/owner" });
outlet({ server: server, subBase: "/outlet" });
wallet({ server: server, subBase: "/wallet" });
location({ server: server, subBase: "/location" });
transaction({ server: server, subBase: "/transaction" });
v1Transaction({ server: server, subBase: "/v1/transaction" });
transfer({ server: server, subBase: "/transfer" });
media({ server: server, subBase: "/media" });
commission({ server: server, subBase: "/commission" });

export default server;

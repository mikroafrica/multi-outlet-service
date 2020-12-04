import restify from "restify";
import { secureRoute } from "./api/middleware.js";
import dotenv from "dotenv";
import { connect } from "./db.js";
import auth from "./api/resources/user/index.js";
import wallet from "./api/resources/wallet";

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
wallet({ server: server, subBase: "/wallet" });

export default server;

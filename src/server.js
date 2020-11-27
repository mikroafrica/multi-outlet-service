import restify from "restify";
import {secureRoute} from "./api/middleware.js";
import dotenv from "dotenv";
import {connect} from "./db.js";
import {initializeSwagger} from "./swagger.js";

const server = restify.createServer({
    name: "mk-multi-outlet-service"
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.use(restify.plugins.conditionalHandler({
    handler: secureRoute
}));

dotenv.config();

connect();

initializeSwagger(server);

export default server;

// import {createLogger, format, transports} from 'winston';
import pkg from "winston";

const { createLogger, format, transports } = pkg;
const { cli } = format;

const logger = createLogger({
  level: "info",
  format: cli(),
  transports: [new transports.Console()],
});

export default logger;

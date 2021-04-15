import { hello } from "./health.controller";

const health = ({ server, subBase }) => {
  server.get("/", hello);
};

export default health;

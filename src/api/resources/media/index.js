import { get, upload } from "./media.controller";

const media = ({ server, subBase }) => {
  server.post(`${subBase}/upload`, upload);
  server.get(`${subBase}/:id`, get);
};

export default media;

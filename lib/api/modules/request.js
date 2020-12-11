import logger from ".././../logger.js";
export const post = ({ client, path, params }) => {
  return new Promise((resolve, reject) => {
    client.post(path, params, function (err, req, res, data) {
      if (err) {
        logger.error(`Error while making post request: ${err}`);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
export const get = ({ client, path }) => {
  return new Promise((resolve, reject) => {
    client.get(path, function (err, req, res, data) {
      if (err) {
        logger.error(`Error while making get request: ${err}`);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
export const put = ({ client, path, params }) => {
  return new Promise((resolve, reject) => {
    client.put(path, params, function (err, req, res, data) {
      if (err) {
        logger.error(`Error while making put request: ${err}`);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

import { UN_AVAILABLE } from "./status";

export const post = ({ client, path, params }) => {
  return new Promise((resolve, reject) => {
    client.post(path, params, function (err, req, res, data) {
      if (err) {
        console.log(err);
        reject({
          message: err.message
            ? err.body.message
              ? err.body.message
              : err.message
            : err,
          statusCode: res.statusCode || UN_AVAILABLE,
        });
      } else {
        resolve({ data, statusCode: res.statusCode });
      }
    });
  });
};

export const put = ({ client, path, params }) => {
  return new Promise((resolve, reject) => {
    client.put(path, params, function (err, req, res, data) {
      if (err) {
        console.log(err);
        reject({
          message: err.message
            ? err.body.message
              ? err.body.message
              : err.message
            : err,
          statusCode: res.statusCode || UN_AVAILABLE,
        });
      } else {
        resolve({ data, statusCode: res.statusCode });
      }
    });
  });
};

export const get = ({ client, path }) => {
  return new Promise((resolve, reject) => {
    client.get(path, function (err, req, res, data) {
      if (err) {
        console.log(err);
        reject({
          message: err.message
            ? err.body.message
              ? err.body.message
              : err.message
            : err,
          statusCode: res.statusCode || UN_AVAILABLE,
        });
      } else {
        resolve({ data, statusCode: res.statusCode });
      }
    });
  });
};

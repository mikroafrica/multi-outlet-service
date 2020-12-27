import request from "request-promise";
import { convertToBase64 } from "./util";

const BasicAuth = () => {
  return convertToBase64(
    `${process.env.MEDIA_SERVICE_USERNAME}:${process.env.MEDIA_SERVICE_PASSWORD}`
  );
};

export const uploadFile = async (fileStream) => {
  const basicAuth = BasicAuth();
  const options = {
    method: "POST",
    uri: `${process.env.MEDIA_SERVICE_URL}/file/upload`,
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    formData: {
      media: fileStream,
    },
  };
  return request(options);
};

export const getFileById = (id) => {
  const basicAuth = BasicAuth();
  const options = {
    method: "GET",
    uri: `${process.env.MEDIA_SERVICE_URL}/file/${id}`,
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  };
  return request(options);
};

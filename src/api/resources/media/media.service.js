import fs from "fs";
import { getFileById, uploadFile } from "../../modules/file-service";
import { BAD_REQUEST, OK } from "../../modules/status";
import logger from "../../../logger";

export const uploadMediaFile = async (file) => {
  if (!file) {
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: `File cannot be empty`,
    });
  }
  const filePath = file.path;
  const fileContent = fs.createReadStream(filePath);

  try {
    const fileData = await uploadFile(fileContent);
    const parseFileData = JSON.parse(fileData);
    const id = parseFileData.data.id;

    fs.unlinkSync(filePath);

    return Promise.resolve({ statusCode: OK, data: { id } });
  } catch (e) {
    logger.error(`file upload failed with error ${e}`);
    return Promise.reject({
      statusCode: BAD_REQUEST,
      message: `File upload failed`,
    });
  }
};

export const getFile = (id) => {
  return getFileById(id);
};

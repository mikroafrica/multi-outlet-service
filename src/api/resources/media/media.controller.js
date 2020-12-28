import { getFile, uploadMediaFile } from "./media.service";

export const upload = (req, res) => {
  const file = req.files.file;
  uploadMediaFile(file)
    .then((dataObj) => {
      res.send(dataObj.statusCode, { status: true, data: dataObj.data });
    })
    .catch((e) => {
      res.send(e.statusCode, { status: false, message: e.message });
    });
};

export const get = (req, res) => {
  const id = req.params.id;
  getFile(id).pipe(res);
};

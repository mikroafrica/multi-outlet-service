import { fetchAllStates, fetchLgaByState } from "./location.service";

export const locationState = (req, res) => {
  fetchAllStates()
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch((e) => {
      res.send(e.statusCode, { status: false, message: e.message });
    });
};

export const locationLgaByState = (req, res) => {
  const state = req.params.state;
  fetchLgaByState(state)
    .then(({ statusCode, data }) => {
      res.send(statusCode, { status: true, data });
    })
    .catch((e) => {
      res.send(e.statusCode, { status: false, message: e.message });
    });
};

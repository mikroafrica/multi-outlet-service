import {
  create,
  update,
  getAllCommissions,
  createOwnersCommission,
  deleteAssignedCommission,
} from "./commission.service";

export const createCommission = (req, res) => {
  const params = req.body;

  create({ params })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const getCommission = (req, res) => {
  getAllCommissions()
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const updateCommission = (req, res) => {
  const params = req.body;
  const id = req.params.id;
  update({ params, id })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const ownersCommission = (req, res) => {
  const params = req.body;
  const ownerId = req.params.id;
  createOwnersCommission({ params, ownerId })
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

export const deleteCommissionById = (req, res) => {
  const id = req.params.id;
  deleteAssignedCommission(id)
    .then(({ statusCode, data }) =>
      res.send(statusCode, { status: true, data })
    )
    .catch(({ statusCode, message }) =>
      res.send(statusCode, { status: false, message })
    );
};

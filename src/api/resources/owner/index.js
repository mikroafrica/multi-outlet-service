import {
  updateUserProfile,
  fetchUsersByType,
  fetchOwnerById,
  fetchTicketsforUsers,
  getMyAccount,
} from "./owner.controller";

const owner = ({ server, subBase }) => {
  server.get(`${subBase}`, fetchUsersByType);
  server.get(`${subBase}/details`, getMyAccount);
  server.get(`${subBase}/user/:id`, fetchOwnerById);
  server.put(`${subBase}/update-profile`, updateUserProfile);
  server.get(`${subBase}/:ownerId/tickets`, fetchTicketsforUsers);
};

export default owner;

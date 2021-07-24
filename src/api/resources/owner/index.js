import {
  getMyAccount,
  fetchOwnerById,
  fetchUsersByType,
  updateUserProfile,
  fetchTicketsForUsers,
  generateAccessCode,
  getReferredUsers,
} from "./owner.controller";

const owner = ({ server, subBase }) => {
  server.get(`${subBase}`, fetchUsersByType);
  server.get(`${subBase}/details`, getMyAccount);
  server.get(`${subBase}/:id`, fetchOwnerById);
  server.put(`${subBase}/update-profile`, updateUserProfile);
  server.post(`${subBase}/codegen`, generateAccessCode);
  server.get(`${subBase}/referral`, getReferredUsers);
  server.get(`${subBase}/tickets`, fetchTicketsForUsers);
};

export default owner;

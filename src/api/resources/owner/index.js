import {
  getMyAccount,
  fetchOwnerById,
  fetchUsersByType,
  updateUserProfile,
  fetchTicketsForUsers,
  generateAccessCode,
  getReferredUsers,
  getUserMetrics,
} from "./owner.controller";

const owner = ({ server, subBase }) => {
  server.get(`${subBase}/details`, getMyAccount);
  server.get(`${subBase}/:id`, fetchOwnerById);
  server.put(`${subBase}/update-profile`, updateUserProfile);
  server.post(`${subBase}/codegen`, generateAccessCode);
  server.get(`${subBase}/referral`, getReferredUsers);
  server.get(`${subBase}/tickets`, fetchTicketsForUsers);
  server.get(`${subBase}/all/users`, fetchUsersByType);
  server.get(`${subBase}/user/metrics`, getUserMetrics);
};

export default owner;

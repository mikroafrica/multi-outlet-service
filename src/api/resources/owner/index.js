import {
  resendVerificationEmail,
  signup,
  login,
  validateVerificationEmail,
  changePasswordRequest,
  resetMultiOutletOwnerPassword,
  resetPasswordRequest,
  updateUserProfile,
  fetchOwnerDetails,
} from "./owner.controller";

const auth = ({ server, subBase }) => {
  server.post(`${subBase}/signup`, signup);
  server.post(`${subBase}/login`, login);
  server.post(`${subBase}/email-verification`, resendVerificationEmail);
  server.post(`${subBase}/email-validation`, validateVerificationEmail);
  server.post(`${subBase}/reset-password-request`, resetPasswordRequest);
  server.put(`${subBase}/reset-password`, resetMultiOutletOwnerPassword);
  server.put(`${subBase}/change-password`, changePasswordRequest);
  server.put(`${subBase}/update-profile`, updateUserProfile);
  server.get(`${subBase}/details`, fetchOwnerDetails);
};

export default auth;

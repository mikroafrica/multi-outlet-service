import {
  signup,
  login,
  resetPasswordRequest,
  changePasswordRequest,
  resendVerificationEmail,
  validateVerificationEmail,
  resetMultiOutletOwnerPassword,
} from "./auth.controller";

const auth = ({ server, subBase }) => {
  server.post(`${subBase}/login`, login);
  server.post(`${subBase}/signup`, signup);
  server.post(`${subBase}/email-verification`, resendVerificationEmail);
  server.post(`${subBase}/email-validation`, validateVerificationEmail);
  server.post(`${subBase}/reset-password-request`, resetPasswordRequest);
  server.put(`${subBase}/reset-password`, resetMultiOutletOwnerPassword);
  server.put(`${subBase}/change-password`, changePasswordRequest);
};

export default auth;

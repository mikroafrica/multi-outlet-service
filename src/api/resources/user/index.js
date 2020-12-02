import {
  resendVerificationEmail,
  signup,
  validateVerificationEmail,
} from "./user.controller.js";

const auth = ({ server, subBase }) => {
  server.post(`${subBase}/signup`, signup);
  server.post(`${subBase}/email-verification`, resendVerificationEmail);
  server.post(`${subBase}/email-validation`, validateVerificationEmail);
};

export default auth;

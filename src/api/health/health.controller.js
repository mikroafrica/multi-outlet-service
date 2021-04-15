import { OK } from "../modules/status";

export const hello = (req, res) =>
  res.send(OK, {
    status: true,
    message: "Welcome to Outlet Service",
  });

import {} from "./transfer.service";

export const transferToOutletOwner = (req, res) => {
  const outletOwnerId = req.user.userId;
  const outletUserId = req.params.id;
};

export const transferTOOutlet = (req, res) => {
  const outletOwnerId = req.user.userId;
  const outletUserId = req.params.id;
};

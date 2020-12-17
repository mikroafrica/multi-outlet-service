export const OutletStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};

export const AuthServiceAction = {
  suspend: "INACTIVE",
  unsuspend: "ACTIVE",
};

export const OutletStatusAction = {
  suspend: OutletStatus.SUSPENDED,
  unsuspend: OutletStatus.ACTIVE,
};

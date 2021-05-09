import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { UserType, PartnerApproval } from "./user.type";
import { UserRole } from "./user.role";
import { Commission } from "./commission.model";

const schema = {
  userId: String,
  walletId: String,
  phoneNumber: String,
  noOfOutlets: String,
  commissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "commission",
    },
  ],
  userType: {
    type: String,
    default: UserType.OUTLET_OWNER,
    enum: [UserType.OUTLET_OWNER, UserType.OUTLET_PARTNER],
  },
  approval: {
    type: String,
    default: PartnerApproval.PENDING,
    enum: [PartnerApproval.APPROVED, PartnerApproval.PENDING],
  },
  role: {
    type: String,
    default: UserRole.ADMIN,
    enum: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES],
  },
  linkedUser: {},
};

const ownerSchema = new mongoose.Schema(schema, { timestamps: true });
ownerSchema.plugin(mongoosePaginate);

export const Owner = mongoose.model("owner", ownerSchema);

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { UserType, PartnerApproval } from "./user.type";

const schema = {
  userId: String,
  ownerId: String,
  walletId: String,
  phoneNumber: String,
  noOfOutlets: String,
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
};

const ownerSchema = new mongoose.Schema(schema, { timestamps: true });
ownerSchema.plugin(mongoosePaginate);

ownerSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Owner = mongoose.model("owner", ownerSchema);

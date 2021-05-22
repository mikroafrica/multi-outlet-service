import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { UserType, Approval } from "./user.type";

const schema = {
  userId: String,
  outletId: String,
  walletId: String,
  noOfOutlets: String,
  userType: {
    type: String,
    default: UserType.OUTLET_OWNER,
    enum: [UserType.OUTLET_OWNER, UserType.PARTNER],
  },
  approval: {
    type: String,
    default: Approval.PENDING,
    enum: [Approval.APPROVED, Approval.PENDING],
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

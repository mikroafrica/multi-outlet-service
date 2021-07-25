import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { UserType, Approval, CommissionStatus } from "./user.type";

const schema = {
  userId: String,
  walletId: String,
  noOfOutlets: String,
  phoneNumber: String,
  userType: {
    type: String,
    default: UserType.OUTLET_OWNER,
    enum: [UserType.OUTLET_OWNER, UserType.PARTNER],
  },
  approval: {
    type: String,
    enum: [Approval.APPROVED, Approval.PENDING],
  },
  commissionStatus: {
    type: String,
    default: CommissionStatus.NONE,
    enum: Object.keys(CommissionStatus),
  },

  // referral id is mostly used partners for user referral
  referralId: {
    type: String,
  },

  // to generate a referral code, you need an access code.
  // during partner creation, an access code is assigned to a partner
  referralAccessCode: {
    type: String,
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

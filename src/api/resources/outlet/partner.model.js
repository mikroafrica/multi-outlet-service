import mongoose from "mongoose";
import { OutletStatus } from "./outlet.status.js";
import { Outletpartner } from "./outletpartner.model";
import { PartnerApproval, UserType } from "../owner/user.type";

const schema = {
  ownerId: String,
  accountName: String,
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  profileImageId: String,
  gender: String,
  businessName: String,
  businessType: String,
  email: String,
  phoneNumber: String,
  userType: String,
  status: {
    type: String,
    default: OutletStatus.ACTIVE,
    enum: [OutletStatus.ACTIVE, OutletStatus.SUSPENDED],
  },
  approval: {
    type: String,
    default: PartnerApproval.PENDING,
    enum: [PartnerApproval.APPROVED, PartnerApproval.PENDING],
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "outletpartner",
    },
  ],
};

const partnerSchema = new mongoose.Schema(schema, { timestamps: true });

partnerSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Partner = mongoose.model("partner", partnerSchema);

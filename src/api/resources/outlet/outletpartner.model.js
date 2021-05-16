import mongoose from "mongoose";
import { OutletStatus } from "./outlet.status";
import { Partner } from "./partner.model";

const schema = {
  outletUserId: String,
  userId: String,
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "partner",
  },
  status: {
    type: String,
    default: OutletStatus.ACTIVE,
    enum: [OutletStatus.ACTIVE, OutletStatus.SUSPENDED],
  },
};

const outletpartnerSchema = new mongoose.Schema(schema, {
  timestamps: true,
});

outletpartnerSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Outletpartner = mongoose.model(
  "outletpartner",
  outletpartnerSchema
);

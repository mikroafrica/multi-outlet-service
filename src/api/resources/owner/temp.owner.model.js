import mongoose from "mongoose";
import { UserType } from "./user.type";

const schema = {
  userId: String,
  phoneNumber: String,
  noOfOutlets: String,
  userType: {
    type: String,
    enum: [UserType.OUTLET_OWNER, UserType.PARTNER],
  },
};

const tempOwnerSchema = new mongoose.Schema(schema, { timestamps: true });

tempOwnerSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const TempOwner = mongoose.model("temp_owner", tempOwnerSchema);

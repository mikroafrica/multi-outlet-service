import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { UserStatus } from "../user/user.type.js";

const schema = {
  outletId: String,
  ownerId: String,
  status: {
    type: String,
    default: UserStatus.ACTIVE,
    enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED],
  },
};

const outletSchema = new mongoose.Schema(schema, { timestamps: true });
outletSchema.plugin(mongoosePaginate);

export const Outlet = mongoose.model("outlet", outletSchema);

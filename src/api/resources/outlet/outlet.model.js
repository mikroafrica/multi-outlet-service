import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { OutletStatus } from "./outlet.status.js";

const schema = {
  outletUserId: String,
  ownerId: String,
  outletStatus: {
    type: String,
    default: OutletStatus.ACTIVE,
    enum: [OutletStatus.ACTIVE, OutletStatus.INACTIVE, OutletStatus.BLOCKED],
  },
  isOutletSuspended: {
    type: Boolean,
    default: false,
  },
};

const outletSchema = new mongoose.Schema(schema, { timestamps: true });
outletSchema.plugin(mongoosePaginate);

export const Outlet = mongoose.model("outlet", outletSchema);

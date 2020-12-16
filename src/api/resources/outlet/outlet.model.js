import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { OutletStatus } from "./outlet.status.js";

const schema = {
  userId: String,
  ownerId: String,
  walletId: String,
  status: {
    type: String,
    default: OutletStatus.ACTIVE,
    enum: [OutletStatus.ACTIVE, OutletStatus.INACTIVE, OutletStatus.BLOCKED],
  },
};

const outletSchema = new mongoose.Schema(schema, { timestamps: true });
outletSchema.plugin(mongoosePaginate);

export const Outlet = mongoose.model("outlet", outletSchema);

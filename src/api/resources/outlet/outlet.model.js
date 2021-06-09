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
    enum: [OutletStatus.ACTIVE, OutletStatus.SUSPENDED],
  },
};

const outletSchema = new mongoose.Schema(schema, { timestamps: true });
outletSchema.plugin(mongoosePaginate);

outletSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Outlet = mongoose.model("outlet", outletSchema);

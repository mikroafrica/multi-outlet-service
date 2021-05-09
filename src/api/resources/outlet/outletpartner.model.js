import mongoose from "mongoose";
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

const outletpartnerSchema = new mongoose.Schema(schema, { timestamps: true });

export const Outletpartner = mongoose.model(
  "outletpartner",
  outletpartnerSchema
);

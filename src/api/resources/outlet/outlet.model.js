import mongoose from "mongoose";

const schema = {
  ownerId: String,
  outletId: String,
};

const outletSchema = new mongoose.Schema(schema, { timeStamp: true });

export const Outlet = mongoose.model("outlet", outletSchema);

import mongoose from "mongoose";

const schema = {
  outletId: String,
  ownerId: String,
};

const outletSchema = new mongoose.Schema(schema, { timestamps: true });

export const Outlet = mongoose.model("outlet", outletSchema);

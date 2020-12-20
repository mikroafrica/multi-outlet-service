import mongoose from "mongoose";

const schema = {
  userId: String,
  walletId: String,
};

const ownerSchema = new mongoose.Schema(schema, { timestamps: true });

export const Owner = mongoose.model("owner", ownerSchema);

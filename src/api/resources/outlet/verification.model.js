import mongoose from "mongoose";

const schema = {
  verificationId: String,
  outletId: String,
  ownerId: String,
  status: String,
};

const verificationSchema = new mongoose.Schema(schema, { timestamps: true });

export const Verification = mongoose.model("verification", verificationSchema);

import mongoose from "mongoose";

const schema = {
  userId: String,
  phoneNumber: String,
  noOfOutlets: String,
};

const tempOwnerSchema = new mongoose.Schema(schema, { timestamps: true });

export const TempOwner = mongoose.model("temp_owner", tempOwnerSchema);

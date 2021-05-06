import mongoose from "mongoose";

const schema = {
  outletUserId: String,
  ownerId: String,
  userOnboarded: Boolean,
};

const partnerverificationSchema = new mongoose.Schema(schema, {
  timestamps: true,
});

export const Partnerverification = mongoose.model(
  "partnerverification",
  partnerverificationSchema
);

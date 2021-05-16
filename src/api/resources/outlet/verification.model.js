import mongoose from "mongoose";

const schema = {
  verificationId: String,
  outletUserId: String,
  ownerId: String,
  status: String,
};

const verificationSchema = new mongoose.Schema(schema, { timestamps: true });

verificationSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Verification = mongoose.model("verification", verificationSchema);

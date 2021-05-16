import mongoose from "mongoose";

const schema = {
  userId: String,
  phoneNumber: String,
  noOfOutlets: String,
};

const tempOwnerSchema = new mongoose.Schema(schema, { timestamps: true });

tempOwnerSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const TempOwner = mongoose.model("temp_owner", tempOwnerSchema);

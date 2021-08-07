import mongoose from "mongoose";

const schema = {
  commissionId: {
    type: String,
  },

  category: {
    type: String,
  },

  name: {
    type: String,
  },

  ownerId: {
    type: String,
  },

  userType: {
    type: String,
  },
};

const commissionOwnerSchema = new mongoose.Schema(schema, { timestamps: true });

commissionOwnerSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const OwnerCommission = mongoose.model(
  "owner-commission",
  commissionOwnerSchema
);

import mongoose from "mongoose";
import { Type } from "./commission.type";
import { Owner } from "../owner/owner.model";

const schema = {
  amount: Number,
  type: {
    type: String,
    enum: [Type.ONBOARDING, Type.TRANSFER, Type.WITHDRAWAL],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "owner",
  },
};

const commissionBalanceSchema = new mongoose.Schema(schema, {
  timestamps: true,
});

commissionBalanceSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const CommissionBalance = mongoose.model(
  "commissionBalance",
  commissionBalanceSchema
);

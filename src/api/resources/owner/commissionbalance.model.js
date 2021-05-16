import mongoose from "mongoose";
import { CommissionType } from "./commission.type";
import { Owner } from "./owner.model";

const schema = {
  amount: Number,
  type: {
    type: String,
    default: CommissionType.ONBOARDING,
    enum: [
      CommissionType.ONBOARDING,
      CommissionType.THRIFT_ONBOARDING,
      CommissionType.TRANSACTION,
    ],
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

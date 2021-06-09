import mongoose from "mongoose";
import { Type } from "./commission.type";
import { Owner } from "../owner/owner.model";

const schema = {
  commissionOnTransfer: Number,
  userId: String,
  transferAmount: Number,
  timeCreated: Number,
  type: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "owner",
  },
};

const transferCommissionSchema = new mongoose.Schema(schema, {
  timestamps: true,
});

transferCommissionSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const TransferCommission = mongoose.model(
  "transferCommission",
  transferCommissionSchema
);

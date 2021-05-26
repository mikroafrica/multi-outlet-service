import mongoose from "mongoose";
import {
  CommissionType,
  TransactionType,
  WithdrawalLevel,
} from "./commission.type";
import { Owner } from "../owner/owner.model";
import { UserRole } from "../owner/user.role";

const schema = {
  condition: Number,
  multiplier: Number,
  type: {
    enum: [
      CommissionType.ONBOARDING,
      CommissionType.THRIFT_ONBOARDING,
      CommissionType.TRANSACTION,
    ],
  },
  transactions: {
    type: String,
    default: TransactionType.NIL,
    enum: [
      TransactionType.TRANSFERS,
      TransactionType.WITHDRAWALS,
      TransactionType.NIL,
    ],
  },
  withdrawals: {
    type: String,
    default: WithdrawalLevel.NA,
    enum: [
      WithdrawalLevel.LEVEL1,
      WithdrawalLevel.LEVEL2,
      WithdrawalLevel.LEVEL3,
      WithdrawalLevel.LEVEL4,
      WithdrawalLevel.LEVEL5,
      WithdrawalLevel.NA,
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "owner",
  },
};

const commissionSchema = new mongoose.Schema(schema, { timestamps: true });

commissionSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Commission = mongoose.model("commission", commissionSchema);

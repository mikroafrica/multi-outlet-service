import mongoose from "mongoose";
import {
  CommissionType,
  TransactionType,
  WithdrawalLevel,
} from "./commission.type";
import { Owner } from "./owner.model";
import { UserRole } from "./user.role";

const schema = {
  condition: Number,
  multiplier: Number,
  type: {
    type: String,
    default: CommissionType.ONBOARDING,
    enum: [
      CommissionType.ONBOARDING,
      CommissionType.THRIFT_ONBOARDING,
      CommissionType.TRANSACTION,
    ],
  },
  transactions: {
    type: String,
    default: TransactionType.TRANSFERS,
    enum: [TransactionType.TRANSFERS, TransactionType.WITHDRAWALS],
  },
  withdrawals: {
    type: String,
    default: WithdrawalLevel.LEVEL1,
    enum: [
      WithdrawalLevel.LEVEL1,
      WithdrawalLevel.LEVEL2,
      WithdrawalLevel.LEVEL3,
      WithdrawalLevel.LEVEL4,
      WithdrawalLevel.LEVEL5,
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "owner",
  },
};

const commissionSchema = new mongoose.Schema(schema, { timestamps: true });

export const Commission = mongoose.model("commission", commissionSchema);

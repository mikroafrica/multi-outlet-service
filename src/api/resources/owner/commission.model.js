import mongoose from "mongoose";
import { CommissionType } from "./commission.type";
import { Owner } from "./owner.model";
import { UserRole } from "./user.role";

const schema = {
  condition: Number,
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
    ref: "Owner",
  },
};

const commissionSchema = new mongoose.Schema(schema, { timestamps: true });

export const Commission = mongoose.model("commission", commissionSchema);

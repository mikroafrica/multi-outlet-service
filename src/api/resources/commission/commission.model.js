import mongoose from "mongoose";
import { CommissionType, WithdrawalLevel } from "./commission.type";
import { Owner } from "../owner/owner.model";
import { UserRole } from "../owner/user.role";

const schema = {
  condition: Number,
  multiplier: Number,
  type: {
    type: String,
    enum: [
      CommissionType.ONBOARDING,
      CommissionType.TRANSFER,
      CommissionType.WITHDRAWAL,
    ],
  },
  level: {
    type: String,
    enum: [
      WithdrawalLevel.LEVEL_ONE,
      WithdrawalLevel.LEVEL_TWO,
      WithdrawalLevel.LEVEL_THREE,
      WithdrawalLevel.LEVEL_FOUR,
      WithdrawalLevel.LEVEL_FIVE,
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

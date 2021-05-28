import mongoose from "mongoose";
import { Type, Level } from "./commission.type";
import { Owner } from "../owner/owner.model";
import { UserRole } from "../owner/user.role";

const schema = {
  condition: Number,
  multiplier: Number,
  type: {
    type: String,
    enum: [Type.ONBOARDING, Type.TRANSFER, Type.WITHDRAWAL],
  },
  level: {
    type: String,
    enum: [
      Level.LEVEL_ONE,
      Level.LEVEL_TWO,
      Level.LEVEL_THREE,
      Level.LEVEL_FOUR,
      Level.LEVEL_FIVE,
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

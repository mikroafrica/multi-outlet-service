import mongoose from "mongoose";

export const CommissionCategory = {
  POS_WITHDRAWAL: "POS_WITHDRAWAL",
  // ON_BOARDING: "ON_BOARDING",
  TRANSFER: "TRANSFER",
};

export const RangeType = {
  RANGE: "RANGE",
  NON_RANGE: "NON_RANGE",
};

export const FeeType = {
  FLAT_FEE: "FLAT_FEE",
  PERCENTAGE: "PERCENTAGE",
};

const schema = {
  name: {
    unique: true,
    type: String,
    index: true,
  },
  category: {
    type: String,
    enum: Object.keys(CommissionCategory),
  },
  feeType: {
    type: String,
    enum: Object.keys(FeeType),
  },
  rangeType: {
    type: String,
    enum: Object.keys(RangeType),
  },

  serviceFee: {
    type: Number,
  },

  rangeList: [
    {
      serviceFee: Number,
      feeType: {
        type: String,
        enum: Object.keys(FeeType),
      },
      rangeAmount: {
        from: Number,
        to: Number,
      },
    },
  ],
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

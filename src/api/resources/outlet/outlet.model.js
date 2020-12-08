import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";

const schema = {
  outletId: String,
  ownerId: String,
};

const outletSchema = new mongoose.Schema(schema, { timestamps: true });
outletSchema.plugin(mongoosePaginate);

export const Outlet = mongoose.model("outlet", outletSchema);

import mongoose from "mongoose";

const schema = {
    outletOwnerId: String,
    outletId: String
};

const outletSchema = new mongoose.Schema(schema, {timeStamp: true});

export const Outlet = mongoose.model('outlet', outletSchema)

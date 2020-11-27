import mongoose from "mongoose";

const schema = {
    outlet: {
        type: mongoose.Schema.ObjectId,
        ref: 'Outlet'
    },
    staffId: String
};

const staffOutletSchema = new mongoose.Schema(schema, {timeStamp: true});

export const StaffOutlet = mongoose.model('staff_outlet', staffOutletSchema)

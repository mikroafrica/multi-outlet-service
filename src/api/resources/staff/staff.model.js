import mongoose from "mongoose";

const schema = {
    outletOwnerId: String,
    firstName: String,
    lastName: String,
    userType: String,
    gender: String,
    dateOfBirth: String,
    identificationId: String
};

const staffSchema = new mongoose.Schema(schema, {timeStamp: true});

export const Staff = mongoose.model('staff', staffSchema);

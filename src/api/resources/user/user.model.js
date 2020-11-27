import mongoose from "mongoose";

const schema = {
    firstName: {
        type: String,
        required: [true, "First Name is required"],
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    birthday: {
        type: String,
        required: [true, "Birthday is required"],
    },
    phoneNumber: String,
    gender: {
        type: String,
        required: [true, "Gender is required"],
    },
    noOfStaff: {
        type: String,
        required: [true, "Number of staff is required"],
    },
    portraitPictureId: String,
    identificationId: String
};

const userSchema = new mongoose.Schema(schema, {timeStamp: true});

export const User = mongoose.model('outlet_owner', userSchema)

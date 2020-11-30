import mongoose from "mongoose";
import {UserType} from "../user.type";

const schema = {
    ownerId: String,
    firstName: String,
    lastName: String,
    userType:  {
        type: String,
        enum: [
            UserType.MANAGER,
            UserType.SALES
        ],
    },
    gender: String,
    dateOfBirth: String,
    identificationId: String
};

const staffSchema = new mongoose.Schema(schema, {timeStamp: true});

export const Staff = mongoose.model('staff', staffSchema);

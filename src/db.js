import mongoose from "mongoose";

mongoose.Promise = global.Promise;

export const connect = () =>
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connected successfully"))
    .catch((e) => {
      console.log(`Failed to connect to mongodb with error ${e}`);
    });

import mongoose from "mongoose";

export const connection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "jobPortal",
    })
    .then(() => {
      console.log("conneted to databse");
    })
    .catch((err) => {
      console.log(`database connection error : ${err}`);
    });
};

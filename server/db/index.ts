import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbUrl: string = process.env.MONGODB_URI!;
    const connectionInstance = await mongoose.connect(dbUrl);
    console.log(
      `MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;

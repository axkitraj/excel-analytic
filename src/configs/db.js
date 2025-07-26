import mongoose from "mongoose";
import colors from "colors";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Database connected...".blue.bold);
  } catch (err) {
    console.error("Database connection error:".red, err);
    process.exit(1);
  }
}

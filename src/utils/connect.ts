import mongoose from "mongoose";
import config from "config";
import log from "./logger";

async function connect() {
  try {
    await mongoose.connect(config.get<string>("MONGO_URL"));
    log.info("Database connected");
  } catch (e) {
    log.error("Could not connected");
    process.exit(1);
  }
}

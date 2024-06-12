import mongoose from "mongoose";
import log from "./logger";


async function connect() {
  try {
    await mongoose.connect(<string>process.env.MONGO_URL);
    log.info("Database connected");
  } catch (e) {
    log.error("Could not connected");
    process.exit(1);
  }
}

export default connect
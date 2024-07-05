import mongoose from "mongoose";
import log from "./logger";

async function connect() {
  try {
    let MONGO_URL;

    MONGO_URL = process.env.NODE_ENV === "development"
        ? process.env.MONGO_URL_DEV
        : process.env.NODE_ENV === "production"
        ? process.env.MONGO_URL_PROD
        : process.env.NODE_ENV === 'testing'
        ? process.env.MONGO_URL_TEST
        : ""

    await mongoose.connect(<string>MONGO_URL);
    log.info("Database connected");
  } catch (e) {
    log.error(e,"Could not connected");
    process.exit(1);
  }
}

export default connect;

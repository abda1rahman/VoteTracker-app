import mongoose from "mongoose";
import log from "./logger";


async function connect() {
  try {
    let MONGO_URL;
    if(process.env.NODE_ENV === "development"){
      MONGO_URL = process.env.MONGO_URL_DEV
    } else if(process.env.NODE_ENV === "production") {
      MONGO_URL = process.env.MONGO_URL_PROD
    }
    
    await mongoose.connect(<string>MONGO_URL);
    log.info("Database connected");
  } catch (e) {
    log.error("Could not connected");
    process.exit(1);
  }
}

export default connect
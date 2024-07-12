import mongoose from "mongoose";
import log from "./logger";

async function connect() {
  try {
    let MONGO_URL;
<<<<<<< Updated upstream
    if(process.env.NODE_ENV === "development"){
      MONGO_URL = process.env.MONGO_URL_DEV
    } else if(process.env.NODE_ENV === "production") {
      MONGO_URL = process.env.MONGO_URL_PROD
    }
    
    await mongoose.connect(<string>MONGO_URL);
    log.info("Database connected");
  } catch (e) {
    log.error(e,"Could not connected");
    process.exit(1);
=======

    switch (process.env.NODE_ENV) {
      case "development":
        MONGO_URL = process.env.MONGO_URL_DEV;
        break;
      case "production":
        MONGO_URL = process.env.MONGO_URL_PROD;
        break;
      case "testing":
        MONGO_URL = process.env.MONGO_URL_TEST;
        break;
      default:
        MONGO_URL = "";
        break;
    }

    if (!MONGO_URL) {
      throw new Error("MongoDB URL not specified for current environment");
    }

    await mongoose.connect(MONGO_URL);

    log.info("Database connected");
  } catch (error) {
    log.error(error, "Could not connect to database");
    throw error; // Re-throw the error to propagate it or handle it accordingly
>>>>>>> Stashed changes
  }
}

export default connect;

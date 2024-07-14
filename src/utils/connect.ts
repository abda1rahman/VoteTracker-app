import mongoose from "mongoose";
import log from "./logger";
import { MongoClient } from "mongodb";

function getMongoUrl(): string {
  let MONGO_URL: string | undefined;

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
      throw new Error("NODE_ENV is not set to a recognized environment");
  }

  if (!MONGO_URL) {
    throw new Error("MongoDB URL is not specified for the current environment");
  }
  return MONGO_URL as string;
}

async function connectDB() {
  try {
    let MONGO_URL = getMongoUrl();

    await mongoose.connect(MONGO_URL);

    log.info("Database connected successfully");
  } catch (error) {
    log.error("Could not connect to database", error);
    throw error; // Re-throw the error to be handled by higher-level code or process exit
  }
}

async function connectClient(): Promise<MongoClient> {
  try {
    const MONGO_URL = getMongoUrl();

    const client = new MongoClient(MONGO_URL);

    await client.connect();

    return client;
  } catch (error: any) {
    log.error(error);
    throw new Error(error);
  }
}

export { connectDB, connectClient };

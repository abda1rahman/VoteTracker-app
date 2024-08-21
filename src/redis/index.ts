import { createClient } from "redis";
import logger from "../utils/logger/index";

// for production use { url: "redis://localhost:6379" }
const HOST = process.env.NODE_ENV === "production" ? "redis" : "localhost";
const client = createClient({
  socket: {
    host: HOST,
    port: 6379,
    reconnectStrategy(retries, cause) {
      if (retries > 10) {
        logger.error("Too many retries on REDIS. Connection Terminated");
        return new Error("Too many retries.");
      } else {
        const wait = Math.min(10 * Math.pow(2, retries), 60000);
        logger.error("waiting", wait, "milliseconds");
        return wait;
      }
    },
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  try {
    await client.connect();
  } catch (error: any) {
    logger.error("Error connection to Redis");
    process.exit(1);
  }
})();

client.on("connect", () => {
  logger.info("connection with Redis");
});

process.on("SIGINT", async () => {
  await client.quit();
  process.exit();
});

export default client;

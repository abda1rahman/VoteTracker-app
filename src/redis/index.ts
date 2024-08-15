import { createClient } from "redis";
import log from "../utils/logger";

// for production use { url: "redis://localhost:6379" }
const host =
  process.env.NODE_ENV === "production" ? process.env.REDIS_HOST : "localhost";
const client = createClient({
  socket: {
    host: "164.92.145.147",
    port: 6379,
    reconnectStrategy(retries, cause) {
      if (retries > 10) {
        console.log("Too many retries on REDIS. Connection Terminated");
        return new Error("Too many retries.");
    } else {
        const wait = Math.min(10 * Math.pow(2, retries), 60000);
        console.log("waiting", wait, "milliseconds");
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
    log.error("Error connection to Redis");
    process.exit(1);
  }
})();

client.on("connect", () => {
  log.info("connection with Redis");
});

process.on("SIGINT", async () => {
  await client.quit();
  process.exit();
});

export default client;

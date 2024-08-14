import { createClient } from "redis";
import log from "../utils/logger";

// for production use { url: "redis://localhost:6379" }
const client = createClient({
  url: "redis://localhost:6379",
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

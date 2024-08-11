import { SchemaFieldTypes } from "redis";
import client from "./index";
import log from "../utils/logger";

export async function setCache(
  key: string,
  value: any,
  ttl: number = 3600 * 4
): Promise<any> {
  try {
    // Ensure value is json format array of object
    await client.json.set(key, "$", value);

    if (ttl) await client.expire(key, ttl);
  } catch (error: any) {
    log.error("error in redis/MemberRecords => setCache", error.message);
  }
}

export async function getCache(key: string): Promise<any | null> {
  try {
    const data = await client.json.get(key);
    return data || null;
  } catch (error: any) {
    log.error("error in redis/MemberRecords => getCache", error.message);
    return;
  }
}

export async function incrementByCache(
  key: string,
  path: string,
  number: number = 3600
): Promise<void> {
  try {
    await client.json.numIncrBy(key, path, number);
  } catch (error: any) {
    log.error("error in redis.service => incrementByCache", error.message);
    return;
  }
}

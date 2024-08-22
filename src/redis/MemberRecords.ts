import { SchemaFieldTypes } from "redis";
import client from "./index";
import log from "../utils/logger/index";

export async function setJsonCache(
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

export async function getJsonCache(key: string): Promise<any | null> {
  try {
    const data = await client.json.get(key);
    return data || null;
  } catch (error: any) {
    log.error("error in redis/MemberRecords => getCache", error.message);
    return;
  }
}

export async function incrementJsonCache(
  key: string,
  path: string,
  number: number = 3600
): Promise<void> {
  try {
    await client.json.numIncrBy(key, path, number);
  } catch (error: any) {
    log.error("error in redis/MemberRecords => incrementJsonCache", error.message);
    return;
  }
}

export async function setHashCache(
  Hashkey: string,
  fieldName:string,
  value:number,
){
  try {
    const Result = await client.HSET(Hashkey, fieldName, value)
    if(Result === 1){
      log.warn(Result)
    }
    return Result;
  } catch (error:any) {
    log.error("error in redis/MemberRecords => setHashCache", error.message);
  }
}
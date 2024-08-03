import log from "../utils/logger";
import client from "../utils/redis";

export async function setCache(key:string, value: any, ttl?: number):Promise<any>
{
  try {
    // await client.setEx(key, ttl, JSON.stringify(value))
    await client.json.set(key, "$", value, )

    if(ttl) await client.expire(key, ttl)

  } catch (error:any) {
    log.error('error in redis.service => setCache', error.message)
    return ;
  }
}

export async function getCache(key:string):Promise<any | null>
{
  try {
    const data  = await client.json.get(key)
    return data || null
  } catch (error:any) {
    log.error('error in redis.service => getCache', error.message)
    return ;
  }
}

export async function incrementByCache(key:string, path:string, number:number = 3600):Promise<void>
{
  try {
    await client.json.numIncrBy(key, path, number)
  } catch (error:any) {
    log.error('error in redis.service => incrementByCache', error.message)
    return;
  }
}
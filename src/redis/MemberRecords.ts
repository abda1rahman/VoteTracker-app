import client from "./index";
import log from "../utils/logger/index";


export async function setHashCache(
  Hashkey: string,
  fieldName:string,
  value:number,
){
  try {
    const Result = await client.HSET(Hashkey, fieldName, value)
    log.debug(`Cache => set key ${Hashkey} => Cachevalue: ${value}`)
    if(Result === 1){
      log.warn(`The member not exist set cache Hashkey:${Hashkey}`)
    }
    return Result;
  } catch (error:any) {
    log.error("error in redis/MemberRecords => setHashCache", error.message);
  }
}
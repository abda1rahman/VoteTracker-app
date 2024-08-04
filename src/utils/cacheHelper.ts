import { Types } from "mongoose";
import { getCache, incrementByCache, setCache } from "../service/redis.service";
import { IStateRecord } from "../model/box.model";
import { getCandidateRecordResult } from "../service/box.service";

export async function updateCacheRecord(envoy: any, newState:IStateRecord, oldState:(IStateRecord | null)) {
  const getCacheKey = (candidateId: Types.ObjectId) =>
    `candidateRecord:${candidateId.toString()}`;

  const cacheKey = getCacheKey(envoy.candidate_id);

  try {
    // Early return if no change in state or voting record has not changed
    if(oldState === newState || (oldState === null && newState == IStateRecord.NOT_VOTE)){
      return;
    }

    // Get cache data from redis
    const cacheData = await getCache(cacheKey);

    const newStateName = getStateKey(newState)
    const oldStateName = getStateKey(oldState)
    
    // Update exist cache
    if (cacheData) {
      if(oldState === null ){
        await incrementByCache(cacheKey, `$.${newStateName}`, 1)
        await incrementByCache(cacheKey, `$.totalNotVote`, -1)
      } else{
        await incrementByCache(cacheKey, `$.${newStateName}`, 1);
        await incrementByCache(cacheKey, `$.${oldStateName}`, -1);
      }

    } else {
      // Fetch total record result from database if cache doesn't exist
      const candidateRecord = await getCandidateRecordResult(envoy.candidate_id)
      await setCache(cacheKey, {
        totalVote: candidateRecord.totalVote,
        totalNotVote: candidateRecord.totalNotVote,
        totalSecret: candidateRecord.totalSecret,
        totalOther: candidateRecord.totalOther,
      });
    }
  } catch (error:any) {
    console.error('error in cacheHelper => updateCacheRecord', error.message);
    throw new Error(error)
  }
}

function getStateKey(state: IStateRecord | null ):string {
  switch (state) {
    case IStateRecord.VOTE:
      return "totalVote";
    case IStateRecord.NOT_VOTE:
      return "totalNotVote";
    case IStateRecord.SECRET:
      return "totalSecret";
    case IStateRecord.OTHERS:
      return "totalOther";
    default: 
    return ''
  }
}


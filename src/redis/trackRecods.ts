import { Types } from "mongoose";
import { getCache, incrementByCache, setCache } from "./MemberRecords";
import { IStateRecord } from "../model/box.model";
import { updateFinalRecord } from "../service/box.service";

export async function updateCacheRecord(
  envoy: any,
  newState: IStateRecord,
  oldState: IStateRecord | null
) {
  const getCacheKey = (candidateId: Types.ObjectId) =>
    `candidateRecord:${candidateId.toString()}`;

  const cacheKey = getCacheKey(envoy.candidate_id);

  try {
    // Early return if no change in state or voting record has not changed
    if (
      oldState === newState ||
      (oldState === null && newState == IStateRecord.NOT_VOTE)
    ) {
      return;
    }

    // Get cache data from redis
    const cacheData = await getCache(cacheKey);

    const newStateName = getStateKey(newState);
    const oldStateName = getStateKey(oldState);

    // Update exist cache
    if (cacheData) {
      if (oldState === null) {
        await incrementByCache(cacheKey, `$.${newStateName}`, 1);
        await incrementByCache(cacheKey, `$.totalNotVote`, -1);
        await updateResultDatabase(newState, oldState, envoy.candidate_id);
      } else {
        await incrementByCache(cacheKey, `$.${newStateName}`, 1);
        await incrementByCache(cacheKey, `$.${oldStateName}`, -1);
        await updateResultDatabase(newState, oldState, envoy.candidate_id);
      }
    } else {
      // Fetch total record result from database if cache doesn't exist
      const candidateTotal = await updateResultDatabase(
        newState,
        oldState,
        envoy.candidate_id
      );


      await setCache(cacheKey, {
        totalVote: candidateTotal,
      });
    }
    
    // return cache data after update or set 
    const dataTotalVote = await getCache(cacheKey);
    return dataTotalVote;
  } catch (error: any) {
    console.error("error in cacheHelper => updateCacheRecord", error.message);
    throw new Error(error);
  }
}

function getStateKey(state: IStateRecord | null): string {
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
      return "";
  }
}

async function updateResultDatabase(
  newState: number,
  oldState: number | null,
  candidate_id: string
) {
  let result = 0;
  if (oldState === IStateRecord.VOTE) {
    result = await updateFinalRecord(candidate_id.toString(), -1);
  }

  if (newState === IStateRecord.VOTE) {
    result = await updateFinalRecord(candidate_id.toString(), 1);
  }

  result  = await updateFinalRecord(candidate_id.toString(), 0)
  return result;
}

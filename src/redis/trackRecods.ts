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
): Promise<number> {
  let delta = 0;

  if (oldState === IStateRecord.VOTE) {
    delta -= 1;
  }

  if (newState === IStateRecord.VOTE) {
    delta += 1;
  }

  return await updateFinalRecord(candidate_id.toString(), delta);
}

// Get total result for web socket
export async function getFinalResultCandidate(candidate_id: string): Promise<number> {
  try {
    // Get current total vote
    const finalResult = await updateFinalRecord(candidate_id, 0);

    return typeof finalResult === 'number' ? finalResult : 0;
  } catch (error: any) {
    console.error("Error in redis/trackRecords => getFinalResultCandidate:", error.message);
    // Return a default value in case of an error
    return 0;
  }
}
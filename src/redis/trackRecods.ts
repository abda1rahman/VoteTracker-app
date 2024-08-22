import { Types } from "mongoose";
import { getJsonCache, setHashCache, incrementJsonCache, setJsonCache } from "./MemberRecords";
import { IMemberType, IStateRecord } from "../model/box.model";
import { searchQueryMember, updateFinalRecord } from "../service/box.service";
import log from "../utils/logger";
import { IMemberSearch } from "../service/types";
import { setCacheHashMember } from "./MemberSearch";

export async function updateCacheRecord(
  envoy: any,
  newState: IStateRecord,
  oldState: IStateRecord | null,
  member: IMemberType
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
    const cacheData = await getJsonCache(cacheKey);

    const newStateName = getStateKey(newState);
    const oldStateName = getStateKey(oldState);

    // Update exist cache
    if (cacheData) {
        // Update member in cache state
        await updateCacheMemberState(newState, member, envoy.box_id)

        // Update total candidate record in cahce and database
        await updateTotalCandidateRecord(cacheKey, newState, oldState, newStateName, oldStateName, envoy.candidate_id)
    } else {
      // Update member in cache state
      await updateCacheMemberState(newState, member, envoy.candidate_id)

      // Fetch total record result from database if cache doesn't exist
      const candidateTotal = await updateResultDatabase(
        newState,
        oldState,
        envoy.candidate_id
      );


      await setJsonCache(cacheKey, {
        totalVote: candidateTotal,
      });
    }
    
    // return cache data after update or set 
    const dataTotalVote = await getJsonCache(cacheKey);
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

async function updateTotalCandidateRecord(cacheKey:string, newState:number, oldState:number | null, newStateName:string, oldStateName:string, candidate_id:string){
  if (oldState === null) {
    // Update candidate totalVote logic 
    await incrementJsonCache(cacheKey, `$.${newStateName}`, 1);
    await incrementJsonCache(cacheKey, `$.totalNotVote`, -1);
    await updateResultDatabase(newState, oldState, candidate_id);
  } else {
    await incrementJsonCache(cacheKey, `$.${newStateName}`, 1);
    await incrementJsonCache(cacheKey, `$.${oldStateName}`, -1);
    await updateResultDatabase(newState, oldState, candidate_id);
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

// Update state member in cache redis 
async function updateCacheMemberState(newState: number, member: IMemberType, box_id: string){
  try {
    const key = `boxMembers:${box_id}:member:${member.identity}`
    const value = newState === IStateRecord.VOTE ? 1 : 0
    const field = 'state'
    const result = await setHashCache(key, field, value)
    // if cache member not exit create all members box again
    if(result === 1){
      const memberList: IMemberSearch[] = await searchQueryMember(box_id);
      // set data in cache
      await setCacheHashMember(
        `boxMembers:${box_id}:member:`,
        memberList,
        3600 * 24 * 2
      ); // set data for 2 days
    }
  } catch (error:any) {
    log.error("Error in redis/trackRecords => updateCacheMemberState:", error.message);
  }
}

// Get total result for web socket
export async function getFinalResultCandidate(candidate_id: string): Promise<number> {
  try {
    // Get current total vote
    const finalResult = await updateFinalRecord(candidate_id, 0);

    return typeof finalResult === 'number' ? finalResult : 0;
  } catch (error: any) {
    log.error("Error in redis/trackRecords => getFinalResultCandidate:", error.message);
    // Return a default value in case of an error
    return 0;
  }
}
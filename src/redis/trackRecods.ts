import { setHashCache } from "./MemberRecords";
import { IMemberType, IStateRecord } from "../model/box.model";
import { searchQueryMember, updateFinalRecord } from "../service/box.service";
import log from "../utils/logger";
import { IMemberSearch } from "../service/types";
import { createIndexMember, setCacheHashMember } from "./MemberSearch";
import { delay } from "../controller/box.controller";

export async function updateCacheRecord(
  envoy: any,
  newState: IStateRecord,
  oldState: IStateRecord | null,
  member: IMemberType
):Promise<number | undefined> {
  try {
    // Early return if no change in state or voting record has not changed
    if (oldState === newState) {
      return ;
    }

    // Update total candidate record in cahce and database
       const totalVote = await updateResultDatabase(newState, oldState, envoy.candidate_id);

    // Update Member state in cache 
       await updateCacheMemberState(newState, member, envoy.box_id, envoy._id)

    return totalVote;
  } catch (error: any) {
    console.error("error in cacheHelper => updateCacheRecord", error.message);
    throw new Error(error);
  }
}

async function updateResultDatabase(
  newState: number,
  oldState: number | null,
  candidate_id: string
): Promise<number> {
  let delta = 0;

  if (oldState === IStateRecord.VOTE && newState !== IStateRecord.VOTE) {
    delta -= 1;
  }

  if (newState === IStateRecord.VOTE) {
    delta += 1;
  }
  const totalRecord = await updateFinalRecord(candidate_id.toString(), delta);
  return totalRecord
}

// Update state member in cache redis 
async function updateCacheMemberState(newState: number, member: IMemberType, box_id: string, envoy_id:string){
  try {
    const key = `boxMembers:${box_id}:${envoy_id}:member:${member.identity}`
    const value = newState === IStateRecord.NOT_VOTE ? 0 : 1
    const field = 'state'
    const result = await setHashCache(key, field, value)
    // if cache member not exit create all members box again
    if(result === 1){
      const memberList: IMemberSearch[] = await searchQueryMember(box_id, envoy_id);
      // set data in cache
      await setCacheHashMember(
        `boxMembers:${box_id}:${envoy_id}:member:`,
        memberList,
        3600 * 24 * 2
      ); // set data for 2 days

      
      // Create index after set cache
      await createIndexMember(box_id, envoy_id);

      await delay(500)
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
import { Types } from "mongoose"
import { MemberModel, BoxesModel, VoteRecordModel, VoteRecordType, IStateRecord } from "../model/box.model"
import { EnvoyModel } from "../model/users.model"
import { BoxesInput } from "../schema/box.schema"
import logger from "../utils/logger"
import { IcandidateResult, IMembersInfo } from "./types"

export type Ibox = {
id: string;
} & BoxesInput

type Irecord = {} & Omit<VoteRecordType, 'candidate_id'> | null

async function findBoxByCandidateAndId(box_id: string, candidate_id: string){
try {
  const box = await EnvoyModel.findOne({ box_id, candidate_id })
  return box
} catch (error: any) {
      logger.error("Error in service findBoxByCandidateAndId", error.message);
  throw new Error(error)
}
}

async function findBoxById(box_id:string){
  try {
    const box = await BoxesModel.findById(box_id);
    return box;
  } catch (error: any) {
        logger.error("Error in service findBoxById", error.message);
    throw new Error(error)
  }
}

async function findRecordMember(member_id:string):Promise<IStateRecord | null>{
try {
  const Record = await VoteRecordModel.findOne({member_id})

  if(!Record) return null;

  return Record!.state
} catch (error:any) {
  logger.error("Error in service findRecordMember", error.message);
  throw new Error(error);
}
}

async function createBox(boxData:BoxesInput):Promise<Ibox>{
  const {log, lat, boxName, city_id} = boxData;
try {
  const box = await BoxesModel.create({
    log,
    lat,
    boxName,
    city_id,
  });

  return {
    ...box.toJSON(),
    id: box.id.toString()
  } as Ibox
} catch (error:any) {
  logger.error("Error in service createBox", error.message);
  throw new Error(error);
}
}

async function findBox(city_id: number, boxName: string):Promise<Ibox | null>{
  try {
    const box = await BoxesModel.findOne({ city_id, boxName });

    if(!box) return null

    return {
      ...box.toJSON(),
      id:box.id.toString()
    }
  } catch (error:any) {
    logger.error("Error in service findBox", error.message);
    throw new Error(error)
  }
}

async function findMemberBySsn(ssn: string){
  try {
    const member = await MemberModel.findOne({ssn})

    return member;
  } catch (error:any) {
    logger.error("Error in service findMemberBySsn", error.message);
    throw new Error(error)
  }
}

async function createMember(firstName:string, lastName:string, ssn:string, boxName:string, box_id:string){
  try {
    const member = await MemberModel.create({
      box_id,
      boxName,
      firstName,
      lastName,
      ssn,
    });

    return member
  } catch (error:any) {
    logger.error("Error in service createMember", error.message);
    throw new Error(error)
  }
}

async function getAllBoxes(city_id: string){
  try {
    const allBox = await BoxesModel.aggregate([
      {$match: {city_id: parseInt(city_id)}},
      { $lookup: { from: "cities", localField: "city_id", foreignField: "city_id", as: "city" }},
      { $unwind: "$city" },
      { $addFields: { id: "$_id", city: "$city.city" } },
      { $project: { _id:0, __v:0} },
    ]);

    return allBox
  } catch (error:any) {
    logger.error("Error in service getAllBoxes", error.message);
    throw new Error(error)
  }
}

async function getBoxByNameAndCity_id(boxName:string, city_Id:number){
  try {
    const box:any = await BoxesModel.aggregate([
      { $match: { city_id: 1, boxName: boxName } },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "city_id",
          as: "cities"
        }
      },
      { $unwind: "$cities" },
      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "box_id",
          as: "allmembers"
        }
      },
      {
        $addFields: {
          boxInfo: {
            id: "$_id",
            city: {
              city_id: "$cities.city_id",
              cityName: "$cities.city"
            },
            log: "$log",
            lat: "$lat",
            boxName: "$boxName"
          },
          members: {
            $map: {
              input: "$allmembers",
              as: "member",
              in: {
                id: "$$member._id",
                box_id: "$$member.box_id",
                firstName: "$$member.firstName",
                lastName: "$$member.lastName",
                ssn: "$$member.ssn"
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          boxInfo: 1,
          members: 1
        }
      },
    ])

    return box[0]
  } catch (error:any) {
    logger.error("Error in service getBoxByNameAndCity_id", error.message);
    throw new Error(error)
  }
}

async function updateVoteRecord(envoy_id:string, member_id:string, state:IStateRecord):Promise<Irecord>{
try {
  const filter = {envoy_id: new Types.ObjectId(envoy_id), member_id: new Types.ObjectId(member_id)};
  const update = {state}
  const options = {new: true, upsert: true,  setDefaultsOnInsert: true}

  const VoteRecord = await VoteRecordModel.findOneAndUpdate(filter, update, options);

  return VoteRecord
} catch (error:any) {
  logger.error("Error in service updateVoteRecord", error.message);
  throw new Error(error);
}
}

async function searchQueryMember(search:string) {
  try {
    let searchResponse
    if(Number.isFinite(Number(search))){
      searchResponse = await MemberModel.find({identity: search});
    } else {
       searchResponse = await MemberModel.find({$text: {$search:`\"${search}\"` }})
      .limit(6).sort({firstName: -1})
    }    

    return searchResponse;
  } catch (error:any) {
    logger.error("Error in service searchQueryMember", error.message);
    throw new Error('Failed to perform search query');
  }
}

async function getMembersDataVote(envoy_id: string) {
  try {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(envoy_id) } },
      {
        $lookup: {
          from: 'boxes',
          localField: 'box_id',
          foreignField: '_id',
          as: 'boxes'
        }
      },
      {
        $lookup: {
          from: 'members',
          let: { boxId: { $arrayElemAt: ['$boxes._id', 0] } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$box_id', '$$boxId'] }
              }
            },
            {
              $lookup: {
                from: 'vote_records',
                let: { memberId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$member_id', '$$memberId'] }
                    }
                  }
                ],
                as: 'records'
              }
            },
            {
              $project: {
                id: '$_id',
                _id: 0,
                box_id: 1,
                firstName: 1,
                lastName: 1,
                ssn: 1,
                state: {
                  $cond: {
                    if: { $gt: [{ $size: '$records' }, 0] },
                    then: { $arrayElemAt: ['$records.state', 0] },
                    else: 0
                  }
                }
              }
            }
          ],
          as: 'members'
        }
      },
      {
        $unset:[
        'boxes.__v'  
        ]
      },
      {
        $project: {
          boxName: {$arrayElemAt: ['$boxes.boxName', 0]},
          members: 1,
          _id:0,
        }
      }
    ]
    const members: IMembersInfo[] | IMembersInfo  = await EnvoyModel.aggregate(pipeline);

    return members[0]

  } catch (error:any) {
    logger.error("Error in service getMembersDataVote", error.message);
    throw new Error(error);
  }
}

async function getCandidateRecordResult(candidate_id: string):Promise<IcandidateResult>{
  try {
    const pipeline = [
      {
        $match: {
          candidate_id: new Types.ObjectId(candidate_id)
        }
      },
      {
        $lookup: {
          from: "boxes",
          localField: "box_id",
          foreignField: "_id",
          as: "boxes"
        }
      },
      {
        $unwind: {
          path: "$boxes",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "members",
          localField: "boxes._id",
          foreignField: "box_id",
          as: "members"
        }
      },
      {
        $unwind: {
          path: "$members",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: null,
          totalMembers: {
            $addToSet: "$members._id"
          },
          // Collect unique member IDs
          records: {
            $push: {
              member_id: "$members._id",
              // Collect member IDs for later lookup
              box_id: "$boxes._id"
            }
          }
        }
      },
      {
        $lookup: {
          from: "vote_records",
          let: {
            member_ids: "$totalMembers"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$member_id", "$$member_ids"]
                }
              }
            },
            {
              $group: {
                _id: "$state",
                count: {
                  $sum: 1
                }
              }
            }
          ],
          as: "state_counts"
        }
      },
      {
        $addFields: {
          MembersCount: {
            $size: "$totalMembers"
          } // Count the unique members
        }
      },
      {
        $unwind: {
          path: "$state_counts",
          preserveNullAndEmptyArrays: true // Preserve if no state_counts
        }
      },
      {
        $group: {
          _id: null,
          MembersCount: {
            $first: "$MembersCount"
          },
          totalVote: {
            $sum: {
              $cond: [
                {
                  $eq: ["$state_counts._id", 1]
                },
                "$state_counts.count",
                0
              ]
            }
          },
          totalSecret: {
            $sum: {
              $cond: [
                {
                  $eq: ["$state_counts._id", 2]
                },
                "$state_counts.count",
                0
              ]
            }
          },
          totalOther: {
            $sum: {
              $cond: [
                {
                  $eq: ["$state_counts._id", 3]
                },
                "$state_counts.count",
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
        totalNotVote : {
          $subtract: [
            '$MembersCount', {$add: ['$totalVote', '$totalOther', '$totalSecret']}
          ]
        }
        }
      },
      {
        $unset: '_id'
      }
    ]
    
    const result: IcandidateResult[] = await EnvoyModel.aggregate(pipeline)
    return result[0] 
  } catch (error:any) {
    logger.error('Error in service getCandidateRecordResult', error.message)
    throw new Error(error)
  }
}

export {
  findBoxByCandidateAndId,
  findBoxById,
  createBox,
  findBox,
  findMemberBySsn,
  createMember,
  getAllBoxes,
  getBoxByNameAndCity_id,
  updateVoteRecord,
  searchQueryMember,
  getMembersDataVote,
  findRecordMember,
  getCandidateRecordResult
}
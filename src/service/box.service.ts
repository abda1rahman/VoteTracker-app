import { PipelineStage, Types } from "mongoose";
import {
  MemberModel,
  BoxesModel,
  VoteRecordModel,
  VoteRecordType,
  IStateRecord,
  FinalResultModel,
} from "../model/box.model";
import { EnvoyModel } from "../model/users.model";
import { BoxesInput } from "../schema/box.schema";
import logger from "../utils/logger/index";
import { IMemberSearch, IMembersInfo } from "./types";

type Ibox =
  | ({
      id: string;
    } & BoxesInput)
  | null;

type Irecord = ({} & Omit<VoteRecordType, "candidate_id">) | null;

async function findBoxByCandidateAndId(box_id: string, candidate_id: string) {
  try {
    const box = await EnvoyModel.findOne({ box_id, candidate_id });
    return box;
  } catch (error: any) {
    logger.error("Error in service findBoxByCandidateAndId", error.message);
    throw new Error(error);
  }
}

async function findBoxById(box_id: string) {
  try {
    const box = await BoxesModel.findById(box_id);
    return box;
  } catch (error: any) {
    logger.error("Error in service findBoxById", error.message);
    throw new Error(error);
  }
}

async function findRecordMember(
  envoy_id: string,
  member_id: string
): Promise<IStateRecord | null> {
  try {
    const Record = await VoteRecordModel.findOne({ member_id, envoy_id });

    if (!Record) return null;

    return Record!.state;
  } catch (error: any) {
    logger.error("Error in service findRecordMember", error.message);
    throw new Error(error);
  }
}

async function createBox(boxData: BoxesInput): Promise<Ibox> {
  const { log, lat, boxName, city_id } = boxData;
  try {
    const box = await BoxesModel.create({
      log,
      lat,
      boxName,
      city_id,
    });

    return {
      ...box.toJSON(),
      id: box.id.toString(),
    };
  } catch (error: any) {
    logger.error("Error in service createBox", error.message);
    throw new Error(error);
  }
}

async function findBox(city_id: number, boxName: string): Promise<Ibox> {
  try {
    const box = await BoxesModel.findOne({ city_id, boxName });

    if (!box) return null;

    return {
      ...box.toJSON(),
      id: box.id.toString(),
    };
  } catch (error: any) {
    logger.error("Error in service findBox", error.message);
    throw new Error(error);
  }
}

async function findMemberBySsn(ssn: string) {
  try {
    const member = await MemberModel.findOne({ ssn });

    return member;
  } catch (error: any) {
    logger.error("Error in service findMemberBySsn", error.message);
    throw new Error(error);
  }
}

async function createMember(
  firstName: string,
  secondName: string,
  thirdName: string,
  lastName: string,
  ssn: string,
  boxName: string,
  box_id: string,
  identity: number
) {
  try {
    const member = await MemberModel.create({
      box_id,
      boxName,
      firstName,
      secondName,
      thirdName,
      lastName,
      ssn,
      identity,
    });

    return member;
  } catch (error: any) {
    logger.error("Error in service createMember", error.message);
    throw new Error(error);
  }
}

async function getAllBoxes(city_id: string) {
  try {
    const allBox = await BoxesModel.aggregate([
      { $match: { city_id: parseInt(city_id) } },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "city_id",
          as: "city",
        },
      },
      { $unwind: "$city" },
      { $addFields: { id: "$_id", city: "$city.city" } },
      { $project: { _id: 0, __v: 0 } },
    ]);

    return allBox;
  } catch (error: any) {
    logger.error("Error in service getAllBoxes", error.message);
    throw new Error(error);
  }
}

async function getBoxByNameAndCity_id(boxName: string, city_Id: number) {
  try {
    const pipeline = [
      { $match: { city_id: city_Id, boxName: boxName } },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "city_id",
          as: "cities",
        },
      },
      { $unwind: "$cities" },
      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "box_id",
          as: "allmembers",
        },
      },
      {
        $addFields: {
          boxInfo: {
            id: "$_id",
            city: {
              city_id: "$cities.city_id",
              cityName: "$cities.city",
            },
            log: "$log",
            lat: "$lat",
            boxName: "$boxName",
          },
          members: {
            $map: {
              input: "$allmembers",
              as: "member",
              in: {
                id: "$$member._id",
                box_id: "$$member.box_id",
                firstName: "$$member.firstName",
                secondName: "$$member.secondName",
                thirdName: "$$member.thirdName",
                lastName: "$$member.lastName",
                ssn: "$$member.ssn",
                identity: "$$member.identity",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          boxInfo: 1,
          members: 1,
        },
      },
    ];
    const box: any = await BoxesModel.aggregate(pipeline);

    return box[0];
  } catch (error: any) {
    logger.error("Error in service getBoxByNameAndCity_id", error.message);
    throw new Error(error);
  }
}

async function updateVoteRecord(
  envoy_id: string,
  member_id: string,
  state: IStateRecord
): Promise<Irecord> {
  try {
    const filter = {
      envoy_id: new Types.ObjectId(envoy_id),
      member_id: new Types.ObjectId(member_id),
    };
    const update = { state };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const VoteRecord = await VoteRecordModel.findOneAndUpdate(
      filter,
      update,
      options
    );

    return VoteRecord;
  } catch (error: any) {
    logger.error("Error in service updateVoteRecord", error.message);
    throw new Error(error);
  }
}

async function searchQueryMember(box_id: string, envoy_id: string) {
  try {
    const pipeline = [
      {
        $match: {
          box_id: new Types.ObjectId(box_id)
        }
      },
      {
        $lookup: {
          from: "vote_records",
          localField: "_id",
          foreignField: "member_id",
          as: "records"
        }
      },
      {
        $set: {
          records: {
            $filter: {
              input: '$records',
              as: 'record',
              cond: { $eq: ["$$record.envoy_id", new Types.ObjectId(envoy_id)] }
            }
          }
        }
      },
      {
        $addFields: {
          state: {
            $cond: {
              if: {
                $or: [
                  { $eq: [{ $arrayElemAt: ["$records.state", 0] }, 0] }, // Check status of the first record
                  { $eq: [{ $size: "$records" }, 0] }, // Check if records array is empty
                ],
              },
              then: 0,
              else: 1,
            },
          },
        },
      },
      {
        $set: {
          id: { $toString: "$_id" },
        },
      },
      {
        $unset: ["records", "box_id", "ssn", "_id", "__v"],
      },
    ];
    const memberList: IMemberSearch[] = await MemberModel.aggregate(pipeline);
    return memberList;
  } catch (error: any) {
    logger.error("Error in service searchQueryMember", error.message);
    throw new Error("Failed to perform search query");
  }
}

async function getMembersDataVote(envoy_id: string) {
  try {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(envoy_id)
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
        $lookup: {
          from: "members",
          let: {
            boxId: { $arrayElemAt: ["$boxes._id", 0] }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$box_id", "$$boxId"] }
              }
            },
            {
              $lookup: {
                from: "vote_records",
                let: { memberId: "$_id", envoyId: new Types.ObjectId(envoy_id) },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$member_id", "$$memberId"] },
                          { $eq: ["$envoy_id", "$$envoyId"] } // Filter by envoy_id here
                        ]
                      }
                    }
                  }
                ],
                as: "records"
              }
            },
            {
              $project: {
                id: "$_id",
                _id: 0,
                box_id: 1,
                firstName: 1,
                secondName: 1,
                thirdName: 1,
                lastName: 1,
                identity: 1,
                ssn: 1,
                state: {
                  $cond: {
                    if: {
                      $gt: [{ $size: "$records" }, 0]
                    },
                    then: {
                      $arrayElemAt: [
                        "$records.state",
                        0
                      ]
                    },
                    else: 0
                  }
                }
              }
            },
            {
              $addFields: {
                sortOrder: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$state", 1] },
                        then: 1
                      },
                      {
                        case: { $eq: ["$state", 0] },
                        then: 2
                      },
                      {
                        case: { $eq: ["$state", 3] },
                        then: 3
                      }
                    ],
                    default: 4 // Default to a value higher than 3 for state 0
                  }
                }
              }
            },
            {
              $sort: { sortOrder: 1 }
            },
            {
              $unset: [
                'sortOrder',
                'box_id',
                'id'
              ]
            }
          ],
          as: "members"
        }
      },
      {
        $project: {
          boxName: { $arrayElemAt: ["$boxes.boxName", 0] },
          members: 1,
          _id: 0,
        },
      },
    ];

    const members: IMembersInfo[] = await EnvoyModel.aggregate(pipeline)

    return members[0];
  } catch (error: any) {
    logger.error("Error in service getMembersDataVote", error.message);
    throw new Error(error);
  }
}

// async function getCandidateRecordResult(candidate_id: string):Promise<IcandidateResult>{
//   // try {

//   //   return result
//   // } catch (error:any) {
//   //   logger.error('Error in service getCandidateRecordResult', error.message)
//   //   throw new Error(error)
//   // }
// }

async function updateFinalRecord(candidate_id: string, value: number) {
  try {
    const filter = { candidate_id: new Types.ObjectId(candidate_id) };
    const update = { $inc: { totalVote: value } };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const result = await FinalResultModel.findOneAndUpdate(
      filter,
      update,
      options
    );

    const totalVote = result?.totalVote ?? 0;
    logger.debug(`Database => Candidate:${candidate_id} inc: ${value} totalValue: ${totalVote}`)
    return totalVote;
  } catch (error: any) {
    logger.error(
      "Error in service/box.service => updateFinalRecord",
      error.message
    );
    throw new Error(error);
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
  updateFinalRecord, Ibox,
};

import { Types } from "mongoose"
import { MemberModel, BoxesModel, VoteRecordModel, VoteRecordType, IStateRecord } from "../model/box.model"
import { EnvoyModel } from "../model/users.model"
import { BoxesInput } from "../schema/box.schema"
import logger from "../utils/logger"

type Ibox = {
id: string;
} & BoxesInput | null

type Irecord = {} & Omit<VoteRecordType, 'candidate_id'> | null

async function findBoxByCandidateAndId(box_id: string, candidate_id: string){
try {
  const box = await EnvoyModel.findOne({ box_id, candidate_id })
  return box
} catch (error: any) {
  logger.error(error)
  throw new Error(error)
}
}

async function findBoxById(box_id:string){
  try {
    const box = await BoxesModel.findById(box_id);
    return box;
  } catch (error: any) {
    logger.error(error)
    throw new Error(error)
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
  };
} catch (error:any) {
  logger.error(error);
  throw new Error(error);
}
}

async function findBox(city_id: number, boxName: string):Promise<Ibox>{
  try {
    const box = await BoxesModel.findOne({ city_id, boxName });

    if(!box) return null;

    return {
      ...box.toJSON(),
      id:box.id.toString()
    }
  } catch (error:any) {
    logger.error(error)
    throw new Error(error)
  }
}

async function findMemberBySsn(ssn: string){
  try {
    const member = await MemberModel.findOne({ssn})

    return member;
  } catch (error:any) {
    logger.error(error)
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
    logger.error(error)
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
    logger.error(error);
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
    logger.error(error);
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
  logger.error(error);
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
    logger.error('Search query error:', error);
    throw new Error('Failed to perform search query');
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
  searchQueryMember
}
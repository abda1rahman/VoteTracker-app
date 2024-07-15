import { Error, Types } from "mongoose";
import {
  CandidateModel,
  DeveloperModel,
  EnvoyModel,
  EnvoyModelType,
  UsersModel,
} from "../model/users.model";
import { omit } from "lodash";
import log from "../utils/logger";
import City from "../model/city.model";
import { BoxMemberModel } from "../model/box.model";
import { ICandidateUser } from "./types";

type IenvoyData = {
  firstName?:string;
  lastName?:string;
  password?:string;
  phone?:string;
  user_id:string;
  newSSN?:string;
}

 async function getUserByIdAndRole(
  role: string,
  userId: Types.ObjectId,
) {
  try {
    let userInfo;
    switch (role) {
      case "envoy":
        userInfo = await EnvoyModel.findOne({ user_id: userId });
        break;
      case "candidate":
        userInfo = await CandidateModel.findOne({ user_id: userId });
        break;
      case "developer":
        userInfo = await DeveloperModel.findOne({ user_id: userId });
        break;
      default:
        throw new Error("Invalid role");
    }
    if (!userInfo) {
      throw new Error("User not found");
    }

    // Return user information with transformed JSON
    return {
      id: userInfo._id,
      ...omit(userInfo.toJSON(), ["user_id"])
    };

  } catch (error: any) {
    throw new Error(error)
  }
}

async function findUserBySsn(ssn: string) {
  try {
    const user = await UsersModel.findOne({ssn})
    
    return user;
  } catch (error: any) {
    log.error(error)
    throw new Error(error)
  }
}

async function findCandidateById(candidate_id: string):Promise<ICandidateUser>{
  try {
    const candidate = await CandidateModel.findById(candidate_id).populate("user_id") 
    return candidate as ICandidateUser
  } catch (error:any) {
    log.error(error)
    throw new Error(error)
  }
}

async function findCity(city_id: number){
  try {
    const city = await City.findOne({city_id})
    return city;
  } catch (error:any) {
    log.error(error);
    throw new Error(error)
  }
}

async function findEnvoyAndMember(envoy_id:string, member_id:string){
 try {
  const [envoy, member]:any = await Promise.all([
    EnvoyModel.findById(envoy_id),
    BoxMemberModel.findById(member_id)
  ])
  
  return {envoy, member}
 } catch (error:any) {
  log.error(error);
  throw new Error(error)
 } 
}

async function findEnvoyById(id:string){
  try {
    const enovy = await EnvoyModel.findById(id);
    return enovy
  } catch (error:any) {
    log.error(error)
    throw new Error(error);
  }
}

async function deleteEnvoyById(user_id:string, envoy_id:string){
  try {
    await UsersModel.findByIdAndDelete(user_id);
    await EnvoyModel.findByIdAndDelete(envoy_id);

  } catch (error:any) {
    log.error(error);
    throw new Error(error)
  }
}

async function deleteCandidateById(user_id:string, candidate_id:string){
  try {
    await UsersModel.findByIdAndDelete(user_id);
    await CandidateModel.findByIdAndDelete(candidate_id);

  } catch (error:any) {
    log.error(error);
    throw new Error(error)
  }
}

async function findEnvoyByRole(ssn:string){
  try {
    const envoy = await UsersModel.findOne({ ssn, role: "envoy" });

    return envoy
  } catch (error:any) {
    log.error(error)
    throw new Error(error)
  }
}

async function updateEnvoyData(envoyData:IenvoyData){
try {
      // // Validate and update field if provided
      const {firstName, lastName, password, phone, user_id, newSSN} = envoyData
      let updatedUserData: any = {
        firstName,
        lastName,
        password,
        phone,
      };
  
      if(newSSN){
        updatedUserData.ssn = newSSN
      }
  
      // Perform the update
        const updatedUser = await UsersModel.updateOne(
          { _id: user_id },
          updatedUserData
        );
} catch (error:any) {
  log.error(error);
  throw new Error(error)
}
}

async function getAllCandidate(){
  try {
    const allCandidate = await CandidateModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "users"
        }
      },
      { $unwind: "$users" },
      {
        $lookup: {
          from: "cities", // Name of the collection to join with
          localField: "users.city_id", // Field from the local (UsersModel) collection
          foreignField: "city_id", // Field from the foreign (cities) collection
          as: "city" // Name for the output array field
        }
      },
      { $unwind: "$city" },
      {
        $addFields: {
          city: {
            city_id: "$city.city_id",
            cityName: "$city.city"
          } // Extract the 'city' field from the 'city' document
        }
      },
      {
        $project: {
          _id:0,
          id: {$toString: '$_id'},
          firstName: '$users.firstName',
          lastName: '$users.lastName',
          ssn: '$users.ssn',
          phone: '$users.phone',
          city: {cityName: 1, city_id: 1},
          role: '$users.role',
          
        }
      }
    ]);

    return allCandidate;
  } catch (error:any) {
    log.error(error);
    throw new Error(error)
  }
}

async function getEnvoyByCandidateId(candidate_id: Types.ObjectId){
  try {
    const allEnvoy: EnvoyModelType[] = await EnvoyModel.aggregate([
      {$match: {candidate_id: new Types.ObjectId(candidate_id)}},
      {$lookup: {from: 'users', localField: 'user_id', foreignField: '_id', as: 'users'}},
      {$unwind: '$users'},
      {$lookup: {from: 'cities', localField: 'users.city_id', foreignField:'city_id', as: 'city'}},
      {$unwind: '$city'},
      {$lookup: {from: 'boxes', localField: 'box_id', foreignField: '_id', as: 'boxes'}},
      {$unwind: '$boxes'},
      {$addFields: {city: {city_id:'$city.city_id', cityName:'$city.city'}}},
      {$project: {envoy_id:'$_id', _id: 0, candidate_id:1, firstName:'$users.firstName', lastName:'$users.lastName',
        ssn:'$users.ssn', phone:'$users.phone', role:'$users.role', city:{city_id:1, cityName:1}, 
        boxInfo:{id:'$boxes._id', city_id:'$boxes.city_id', log:'$boxes.log', lat:'$boxes.lat', boxName:'boxes.boxName' } }}
    ])

    return allEnvoy
  } catch (error:any) {
    log.error(error)
    throw new Error(error)
  }
}

async function getAllEnvoy(){
  try {
    const allEnvoy = await EnvoyModel.aggregate([
      {$lookup: {from:'users', localField:'user_id', foreignField:'_id', as:'users'}},
      {$unwind: '$users'},
      {$lookup: {from:'cities', localField:'users.city_id', foreignField:'city_id', as:'city'}},
      {$unwind: '$city'},
      {$addFields: {city: {city_id:'$city.city_id', cityName:'$city.city'}}},
      {$project: {id:'$_id', _id: 0, candidate_id:1, firstName:'$users.firstName', lastName:'$users.lastName',
        ssn:'$users.ssn', phone:'$users.phone', role:'$users.role', city:{city_id:1, cityName:1}, } }
    ])

    return allEnvoy
  } catch (error:any) {
    log.error(error)
    throw new Error(error)
  }
}

export {
  getUserByIdAndRole,
  findUserBySsn,
  findCandidateById,
  findCity,
  findEnvoyAndMember,
  findEnvoyById,
  deleteEnvoyById,
  deleteCandidateById,
  findEnvoyByRole,
  updateEnvoyData,
  getAllCandidate,
  getEnvoyByCandidateId,
  getAllEnvoy
}
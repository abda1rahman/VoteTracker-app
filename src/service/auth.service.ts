import { omit } from "lodash";
import { CandidateModel, DeveloperModel, EnvoyModel, UsersModel } from "../model/users.model";
import { Types } from "mongoose";
import log from "../utils/logger";
import { CreateUserInput } from "../schema/user.schema";
import { AuthTypes } from "./types";

 async function createCandidate(Data: CreateUserInput){
  try {

    const {firstName, lastName, password, ssn, phone, city_id} = Data
    // Create user
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role: "candidate",
    });
    // Create candidate
    const candidate = await CandidateModel.create({ user_id: user.id });
    // Format data
    const candidateData = omit({...user.toJSON(), ...candidate.toJSON(),
       id: candidate.id.toString()}, ['password', 'createdAt', 'updatedAt', 'user_id'])

    return candidateData as AuthTypes.Icandidate;
  } catch (error: any) {
    log.error("Error in service createCandidate", error.message);
    throw new Error(error);
  }
}

async function createEnvoy(Data: AuthTypes.IenvoyInput):Promise<AuthTypes.Ienvoy>{
  try {
    const {firstName, lastName, password, ssn, phone, city_id, box_id, candidate_id} = Data
    // Create user
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role: "envoy",
    });
    
    // Create envoy
    const envoy = await EnvoyModel.create({
      user_id: user._id,
      box_id: new Types.ObjectId(box_id),
      candidate_id: new Types.ObjectId(candidate_id),
    });
    // Format data
    const envoyData = omit({...user.toJSON(), ...envoy.toJSON(), 
      box_id: envoy.box_id.toString(), candidate_id:envoy.candidate_id.toString(),
      id: envoy.id.toString()}, 
      ['password', 'createdAt', 'updatedAt', 'user_id'])

    return envoyData as  AuthTypes.Ienvoy

  } catch (error:any) {
    log.error("Error in service createEnvoy", error.message);
    throw new Error(error)
  }
}

async function createDeveloper(Data: CreateUserInput):Promise<AuthTypes.Ideveloper> {
  try {
    const {firstName, lastName, ssn, phone, password, city_id} = Data
    // Create user
    const user = await UsersModel.create({
      firstName,
      lastName,
      ssn,
      phone,
      password,
      city_id,
      role: "developer",
    });
    // Create developer
    const developer = await DeveloperModel.create({ user_id: user._id });
    // Format data
    const developerData = omit({...user.toJSON(), ...developer.toJSON(),
      id: developer.id.toString()}, ["_id", "password", 'user_id', 'createdAt', 'updatedAt']) 
      
    return developerData as AuthTypes.Ideveloper
    
  } catch (error:any) {
    log.error("Error in service createDeveloper", error.message);
    throw new Error(error)
  }
}

export {createCandidate, createEnvoy, createDeveloper}
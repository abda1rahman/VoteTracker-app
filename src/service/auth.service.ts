import { omit } from "lodash";
import { CandidateModel, DeveloperModel, EnvoyModel, UsersModel } from "../model/users.model";
import { Types } from "mongoose";
import log from "../utils/logger";
import { CreateUserInput } from "../schema/user.schema";
import { AuthTypes } from "./types";

 async function createCandidate(Data: CreateUserInput):Promise<AuthTypes.Icandidate>{
  try {
        const {firstName, lastName, password, ssn, phone, city_id} = Data
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role: "candidate",
    });

    const candidate = await CandidateModel.create({ user_id: user.id });

    const candidateData = {...omit(user.toJSON(), ['_id', 'password', 'user_id']),
      ...candidate.toJSON(),id:candidate.id.toString(), 
    } as AuthTypes.Icandidate

    return candidateData;
  } catch (error: any) {
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
        const enovyData = {
          ...omit(user.toJSON(), ['_id', 'password', 'user_id']),
          ...omit(envoy.toJSON(), '__v'),
            id:envoy.id.toString(),
            box_id: envoy.box_id.toString(),
            candidate_id: envoy.candidate_id.toString()
        } as AuthTypes.Ienvoy

        return enovyData
  } catch (error:any) {
    log.error(error)
    throw new Error(error)
  }
}

async function createDeveloper(Data: CreateUserInput):Promise<AuthTypes.Ideveloper> {
  try {
    const {firstName, lastName, ssn, phone, password, city_id} = Data

    const user = await UsersModel.create({
      firstName,
      lastName,
      ssn,
      phone,
      password,
      city_id,
      role: "developer",
    });

    const developer = await DeveloperModel.create({ user_id: user._id });
    
    const developerData = {
      ...omit(user.toJSON(), ["_id", "password", 'user_id']),
      ...omit(developer.toJSON(), '__v'),
      id: developer.id.toString(),
    } as AuthTypes.Ideveloper

    return developerData;
  } catch (error:any) {
    log.error(error);
    throw new Error(error)
  }
}

export {createCandidate, createEnvoy, createDeveloper}
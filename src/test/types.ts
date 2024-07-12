import { Document, ObjectId, Types } from "mongoose";
import { CreateEnvoyInput } from "../schema/user.schema";
import { EnvoyModelType } from "../model/users.model";

export type IEnvoyData = {

} & CreateEnvoyInput

// export type ICandidateUser = {
//   _id: Types.ObjectId;
//   user_id:{
//     _id: Types.ObjectId;
//     firstName: string;
//     lastName: string;
//     password: string;
//     ssn: string;
//     phone: string;
//     city_id: number;
//     role: "candidate"
//     createdAt: Date;
//     updatedAt: Date;
//   }
// }

export type IEnvoyUser = {
  role: 'envoy',
  createdAt: Date;
  updatedAt: Date
  id: string;
  user_id: string;
  token: string;
} & Omit<CreateEnvoyInput, "password"> 
import mongoose from "mongoose";
import { CandidteModelType, EnvoyModelType, UserModelType } from "../model/users.model";
import { CreateUserInput } from "../schema/user.schema";
import { text } from "body-parser";
import { IMemberType } from "../model/box.model";

export namespace AuthTypes {
  export type Icandidate = {
    id: string;
    role: "candidate"
  } & Omit<CreateUserInput, 'password'>;

  export type IenvoyInput = {
    box_id: string;
    candidate_id: string;
  } & CreateUserInput;

  export type Ienvoy = {
    id: string;
    box_id: string;
    candidate_id: string;
    role: "envoy" 
  } & Omit<CreateUserInput, "password">;
  let test : Ienvoy
  export type Ideveloper = {
    id: string;
    role: "developer";
  } & Omit<CreateUserInput, "password">;
}

// Types User Service
export type ICandidateUser = {
  _id: mongoose.Types.ObjectId
  id: mongoose.Types.ObjectId
  user_id: UserModelType
} & Document | null

export type IEnvoyInfo = {
  envoy: {
    firstName: string;
    lastName: string;
    ssn: string;
    phone: string;
    city_id: number;
    role: 'envoy';
    createdAt: Date;
    updatedAt: Date;
    city: string;
    id: string;
};
  box: {
    id: string;
    city_id: number;
    log: number;
    lat: number;
    boxName: string;
    city: string;
};
totalMember: number;
vote: number;
notVote: number;
secret: number;
others: number;
}

export type Imember = {
  box_id: string
  firstName: string
  lastName: string 
  ssn: string
  id: string
  state: 0 | 1 | 2 | 3 
}

export type IMembersInfo = {
members: Imember[];
boxName: string
}

export type IMemberAndEnvoy = {
  envoy: EnvoyModelType | null
  member: IMemberType | null
}

// Type Box Service
export type IcandidateResult = {
  MembersCount: number;
  totalVote : number;
  totalSecret: number;
  totalOther: number
  totalNotVote : number;
}

export type IMemberSearch = {

  firstName:string;
  secondName:string;
  thirdName:string;
  lastName:string;
  identity:number;
  state: number;
  id: string;
}
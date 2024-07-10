import mongoose from "mongoose";
import { CandidteModelType, UserModelType } from "../model/users.model";
import { CreateUserInput } from "../schema/user.schema";

export namespace AuthTypes {
  export type Icandidate = {
    id: string;
    role: "candidate" | "envoy" | "developer";
  } & Omit<CreateUserInput, "password">;

  export type IenvoyInput = {
    box_id: string;
    candidate_id: string;
  } & CreateUserInput;

  export type Ienvoy = {
    id: string;
    box_id: string;
    candidate_id: string;
    role: "candidate" | "envoy" | "developer";
  } & Omit<CreateUserInput, "password">;

  export type Ideveloper = {
    id: string;
    role: "candidate" | "envoy" | "developer";
  } & Omit<CreateUserInput, "password">;
}

// Types User

export type ICandidateUser = {
  _id: mongoose.Types.ObjectId
  id: mongoose.Types.ObjectId
  user_id: UserModelType
} & Document | null

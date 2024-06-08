import { Types } from "mongoose";
import {
  CandidateModel,
  DeveloperModel,
  EnvoyModel,
} from "../model/users.model";
import { Response } from "express";
import { UserModelType } from "../types/user.types";
import { omit } from "lodash";

export async function getUserByIdAndRole(
  role: string,
  userId: Types.ObjectId,
  res: Response
) {
  let userInfo;
  switch (role) {
    case "envoy":
      userInfo = await EnvoyModel.findOne({ envoyId: userId });
      break; // Add break statements to avoid falling through to subsequent cases
    case "candidate":
      userInfo = await CandidateModel.findOne({ candidteId: userId });
      break;
    case "developer":
      userInfo = await DeveloperModel.findOne({ developerId: userId });
      break;
    default:
      return res.status(400).json({ message: "Invalid role" });
  }
  console.log(JSON.stringify(userInfo))
  // Rename _id to id and omit __v
  const userJson = {
    id: userInfo!._id,
    ...omit(userInfo!.toJSON(), ["_id", "__v"])
  };

  return userJson;
}
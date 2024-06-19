import { Types } from "mongoose";
import {
  CandidateModel,
  DeveloperModel,
  EnvoyModel,
} from "../model/users.model";
import { omit } from "lodash";


export async function getUserByIdAndRole(
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

  } catch (error) {
    console.error('Error retrieving user:', error);
    throw error;
  }
}
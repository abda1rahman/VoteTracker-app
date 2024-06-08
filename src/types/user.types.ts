import mongoose, {Document, Types} from "mongoose";
import { CreateUserInput } from "../schema/user.schema";

// All Types For Model Database
export interface UserModelType extends CreateUserInput, Document {_id: Types.ObjectId}
export interface CandidteModelType extends Document {
  candidateId: mongoose.Types.ObjectId;
}
export interface EnvoyModelType extends Document {
  envoyId: mongoose.Types.ObjectId;
  boxId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
}
export interface DeveloperModelType extends Document {
  developerId: mongoose.Types.ObjectId;
}

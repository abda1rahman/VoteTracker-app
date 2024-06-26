import mongoose, {Document, Types} from "mongoose";
import bcrypt from "bcrypt";

import { CreateUserInput } from "../schema/user.schema";

// All Types For Model Database
export interface UserModelType extends CreateUserInput, Document {}

export interface CandidteModelType extends Document {
  user_id: mongoose.Types.ObjectId ;
}
export interface EnvoyModelType extends Document {
  user_id: mongoose.Types.ObjectId | CreateUserInput; // edit here
  box_id: mongoose.Types.ObjectId;
  candidate_id: mongoose.Types.ObjectId;
}
export interface DeveloperModelType extends Document {
  developer_id: mongoose.Types.ObjectId;
}


// Global User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, requried: true },
    lastName: { type: String, requried: true },
    password: { type: String, requried: true },
    ssn: { type: String, required: true, unique: true },
    phone: { type: String, requried: true },
    city_id: { type: Number, requried: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

// Candidate Model
const candidateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
},{
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    },
  },
});

// Envoy Model
const envoySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  box_id: { type: mongoose.Schema.ObjectId, ref: "boxes", required: true },
  candidate_id: {type: mongoose.Schema.ObjectId, ref: "candidates", required: true}
},{
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    },
  },
});

// Developer Model
const developerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
},{
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    },
  },
});

// Haching password pre save in Database
userSchema.pre<UserModelType>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Hashing user password
    this.password = await bcrypt.hash(<string>this.password, 10);
    next();

});

const UsersModel = mongoose.model<UserModelType>("users", userSchema);
const CandidateModel = mongoose.model<CandidteModelType>(
  "candidates",
  candidateSchema
);
const EnvoyModel = mongoose.model<EnvoyModelType>("envoys", envoySchema);
const DeveloperModel = mongoose.model<DeveloperModelType>(
  "developers",
  developerSchema
);

export { UsersModel, CandidateModel, EnvoyModel, DeveloperModel };

import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";

import {
  CandidteModelType,
  EnvoyModelType,
  UserModelType,
  DeveloperModelType,
} from "../types/user.types";

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
  candidateId: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
});

// Envoy Model
const envoySchema = new mongoose.Schema({
  envoyId: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  boxId: { type: String, required: true },
  candidateId: {type: mongoose.Schema.ObjectId, ref: "candidates", required: true}
});

// Developer Model
const developerSchema = new mongoose.Schema({
  developerId: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
});

// Haching password pre save in Database
userSchema.pre<UserModelType>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 10);
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

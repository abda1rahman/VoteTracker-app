import mongoose, { Document } from "mongoose";
import { CreateUserInput } from "../schema/user.schema";
import bcrypt from "bcrypt";

export interface UserModel extends CreateUserInput, Document {}

const candidateSchema = new mongoose.Schema(
  {
    firstName: { type: String, requried: true },
    lastName: { type: String, requried: true },
    password: { type: String, requried: true },
    ssn: { type: Number, required: true, unique: true },
    phone: { type: String, requried: true },
    city_id: { type: Number, requried: true },
  },
  {
    timestamps: true,
  }
);

candidateSchema.pre<UserModel>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hashing user password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const candidate = mongoose.model<UserModel>("candidate", candidateSchema);
export default candidate;

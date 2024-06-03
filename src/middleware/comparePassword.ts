import candidate from "../model/candidate.model";
import bcrypt from "bcrypt";

export const comparePassword = async (
  candidatePassword: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt
    .compare(candidatePassword, hashPassword)
    .catch((e) => false);
};

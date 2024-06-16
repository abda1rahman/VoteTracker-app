import {Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import log from "../utils/logger";



export const generateToken = (
  userId: Types.ObjectId,
  role: string,
  res: Response
): string => {
try {
  const cookieName = role;

  // Ensure required environment variables are defined
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.ACCESS_TOKEN_TIME || !process.env.RERESH_TOKEN_TIME || !process.env.COOKIE_EXPIRE) {
    throw new Error('Required environment variables are not defined.');
  }

const token = jwt.sign(
{ userId, role },
process.env.ACCESS_TOKEN_SECRET,
{ expiresIn: process.env.ACCESS_TOKEN_TIME }
);

const refreshToken = jwt.sign(
{ userId, role },
process.env.ACCESS_TOKEN_SECRET,
{ expiresIn: process.env.RERESH_TOKEN_TIME}
);

res.cookie(cookieName, refreshToken, {
expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE) ),
});

return token;
} catch (error) {
  log.error("Error generating token:", error)
  throw new Error("Failed to generate token")
}
};



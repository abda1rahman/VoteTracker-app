import {Response } from "express";
import jwt from "jsonwebtoken";
import log from "../utils/logger";



export const generateToken = (
  userId: string,
  role: string,
  res: Response
): string => {
try {
  // Ensure required environment variables are defined
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.ACCESS_TOKEN_TIME || !process.env.RERESH_TOKEN_TIME || !process.env.COOKIE_EXPIRE) {
    log.error('Error enviroment variables in middleware => jwt ')
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

res.cookie('jwt', refreshToken, {
expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE) ),
});

return token;
} catch (error) {
  log.error("Error generating token:", error)
  throw new Error("Failed to generate token")
}
};



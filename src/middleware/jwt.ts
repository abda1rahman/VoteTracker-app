import {Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";



export const generateToken = (
  userId: Types.ObjectId,
  role: string,
  res: Response
): string => {
  const cookieName = role;

  const token = jwt.sign(
    { userId, role },
    <string>process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: <string>process.env.ACCESS_TOKEN_TIME }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    <string>process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: <string>process.env.RERESH_TOKEN_TIME}
  );

  res.cookie(cookieName, refreshToken, {
    expires: new Date(Date.now() + <string>process.env.COOKIE_EXPIRE ),
  });

  return token;
};



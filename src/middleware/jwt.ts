import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "config";



export const generateToken = (
  userId: string,
  role: "developer" | "candidate" | "envoy",
  res: Response
): string => {
  const cookieName = role;

  const token = jwt.sign(
    { userId, role },
    config.get<string>("ACCESS_TOKEN_SECRET"),
    { expiresIn: config.get("ACCESS_TOKEN_TIME") }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    config.get<string>("ACCESS_TOKEN_SECRET"),
    { expiresIn: config.get("RERESH_TOKEN_TIME") }
  );

  res.cookie(cookieName, refreshToken, {
    expires: new Date(Date.now() + config.get<number>("COOKIE_EXPIRE")),
  });

  return token;
};



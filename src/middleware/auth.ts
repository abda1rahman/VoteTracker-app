import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse";

export const isCandidateAuth = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.candidate;
  if (!token) {
    res.status(403).json(errorResponse(res.statusCode,"candidate is not authenticated"));
  }

  try {
    const decode: any = jwt.verify(
      token, <string>process.env.ACCESS_TOKEN_SECRET
    );
    if (decode.role !== "candidate") {
      res.status(403).json(errorResponse(res.statusCode,"candidate is not authenticated"));
    }
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json(errorResponse(res.statusCode, "Authentication failed: Token is expired"));
  }
};

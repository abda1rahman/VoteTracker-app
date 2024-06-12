import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isCandidateAuth = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.candidate;
  if (!token) {
    res.status(403).json({ message: "candidate is not authenticated1" });
  }

  try {
    const decode: any = jwt.verify(
      token, <string>process.env.ACCESS_TOKEN_SECRET
    );
    if (decode.role !== "candidate") {
      res.status(403).json({ message: "candidate is not authenticated2" });
    }
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed: Token is expired" });
  }
};

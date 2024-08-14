import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse";

type UserRole = "candidate" | "envoy" | "developer";

interface JwtPayload {
  userId: string;
  role: UserRole
}

export const authorizeJWT = (roles: UserRole[]) => {
  return (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {

    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json(errorResponse(401, "user is not authenticated"));
    }

    try {
      const decode = jwt.verify(
        token,
        <string>process.env.ACCESS_TOKEN_SECRET
      ) as JwtPayload

      if (!roles.includes(decode.role)) {
        return res.status(403).json(errorResponse(res.statusCode, "user is not authenticated")
          );
      }

      req.user = decode;
      next();
    } catch (error) {
      return res
        .status(401).json(errorResponse(401,"Authentication failed: Token is expired"));
    }
  };
};

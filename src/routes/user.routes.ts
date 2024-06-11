import express, { NextFunction, Request, Response } from "express";
import { isCandidateAuth } from "../middleware/auth";
import { log } from "console";
import { DeveloperModel, UsersModel } from "../model/users.model";
import { deleteUserById } from "../controller/user.controller";
const router = express.Router();

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

router.delete("/api/user/:id", deleteUserById);

export default router;

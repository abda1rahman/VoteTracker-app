import express, { NextFunction, Request, Response } from "express";
import { isCandidateAuth } from "../middleware/auth";
import { log } from "console";
import { DeveloperModel, UsersModel } from "../model/users.model";
import { deleteUserById, getAllCityHandler } from "../controller/user.controller";
import { getBoxesByCitySchema } from "../schema/box.schema";
import validate from "../middleware/validateResource";
const router = express.Router();

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

router.delete("/api/user/:id", deleteUserById);

router.get("/api/allCity", getAllCityHandler)

export default router;

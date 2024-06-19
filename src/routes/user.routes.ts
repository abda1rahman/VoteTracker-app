import express, { NextFunction, Request, Response } from "express";
import { isCandidateAuth } from "../middleware/auth";
import {
  deleteUserById,
  getAllCityHandler,
  updateEnvoyHandler,
} from "../controller/user.controller";
import validate from "../middleware/validateResource";
import { updateEnvoySchema } from "../schema/user.schema";
const router = express.Router();

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

router.delete("/api/user/:id", deleteUserById);

router.put(
  "/api/envoy/update",
  validate(updateEnvoySchema),
  updateEnvoyHandler
);

router.get("/api/allCity", getAllCityHandler);

export default router;

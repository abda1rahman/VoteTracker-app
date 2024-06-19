import express, { NextFunction, Request, Response } from "express";
import {
  deleteUserById,
  getAllCandidateHandler,
  getAllCityHandler,
  getEnvoyByCandidateIdHandler,
  updateEnvoyHandler,
} from "../controller/user.controller";
import validate from "../middleware/validateResource";
import { updateEnvoySchema, getCandidateParamsSchema } from "../schema/user.schema";
const router = express.Router();

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

router.delete("/api/user/:id", deleteUserById);

router.get('/api/user/getAllCandidate', getAllCandidateHandler)

router.get('/api/user/getEnvoyByCandidate/:candidate_id', 
  validate(getCandidateParamsSchema), 
  getEnvoyByCandidateIdHandler) 

router.put(
  "/api/envoy/update",
  validate(updateEnvoySchema),
  updateEnvoyHandler
);

router.get("/api/allCity", getAllCityHandler);

export default router;

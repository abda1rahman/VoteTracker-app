import express, { NextFunction, Request, Response } from "express";
import {
  deleteUserById,
  getAllCandidateHandler,
  getAllCityHandler,
  getAllEnvoyHandler,
  getEnvoyByCandidateIdHandler,
  getEnvoyDetails1Handler,
  updateEnvoyHandler,
} from "../controller/user.controller";
import validate from "../middleware/validateResource";
import {
  updateEnvoySchema,
  getCandidateParamsSchema,
  getEnvoyVoteInfoSchema,
} from "../schema/user.schema";
const router = express.Router();

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

// Delete any user
router.delete("/api/user/:id", deleteUserById);

// Get all candidate
router.get("/api/user/candidates", getAllCandidateHandler);

// Get all envoys by candidateId
router.get(
  "/api/envoys/byCandidate/:candidate_id",
  validate(getCandidateParamsSchema),
  getEnvoyByCandidateIdHandler
);

// Get all envoys
router.get("/api/envoys", getAllEnvoyHandler);

// Update envoy
router.put(
  "/api/envoys",
  validate(updateEnvoySchema),
  updateEnvoyHandler
);


router.get('/api/envoys/voteInfo/:envoyId', 
  validate(getEnvoyVoteInfoSchema),
  getEnvoyDetails1Handler)

// Get all city in jordan
router.get("/api/cities", getAllCityHandler);

export default router;

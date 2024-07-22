import express, { NextFunction, Request, Response } from "express";
import {
  deleteUserById,
  getAllCandidateHandler,
  getAllCityHandler,
  getAllEnvoyHandler,
  getEnvoyByCandidateIdHandler,
  updateEnvoyHandler,
} from "../controller/user.controller";
import validate from "../middleware/validateResource";
import {
  updateEnvoySchema,
  getCandidateParamsSchema,
} from "../schema/user.schema";
const router = express.Router();

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

// Delete any user
router.delete("/api/user/:id", deleteUserById);

// Get all candidate
router.get("/api/user/getAllCandidate", getAllCandidateHandler);

// Get all envoys by candidateId
router.get(
  "/api/user/getEnvoyByCandidate/:candidate_id",
  validate(getCandidateParamsSchema),
  getEnvoyByCandidateIdHandler
);

// Get all envoys
router.get("/api/user/getAllEnvoy", getAllEnvoyHandler);

// Update envoy
router.put(
  "/api/envoy/update",
  validate(updateEnvoySchema),
  updateEnvoyHandler
);

router.get('/api/envoyId')

// Get all city in jordan
router.get("/api/allCity", getAllCityHandler);

export default router;

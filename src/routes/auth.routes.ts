import express from "express";
import {
  createEnvoySchema,
  createUserSchema,
  loginUserSchema,
} from "../schema/user.schema";
import validateResoure from "../middleware/validateResource";
import {
  registerCandidateHandler,
  loginUserHandler,
  registerDeveloperHandler,
  registerEnvoyHandler,
} from "../controller/auth.controller";

const router = express.Router();
// Register candidate
router.post(
  "/api/auth/register/candidate",
  validateResoure(createUserSchema),
  registerCandidateHandler
);

// Register envoy
router.post(
  "/api/auth/register/envoy",
  validateResoure(createEnvoySchema),
  registerEnvoyHandler
);

// Register developer
router.post(
  "/api/auth/register/developer",
  validateResoure(createUserSchema),
  registerDeveloperHandler
);

router.post(
  "/api/auth/login",
  validateResoure(loginUserSchema),
  loginUserHandler
);

export default router;

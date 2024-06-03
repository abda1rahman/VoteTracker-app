import express, { Request, Response } from "express";
import { createUserSchema, loginUserSchema } from "../schema/user.schema";
import validateResoure from "../middleware/validateResource";
import {
  createCandidateHandler,
  loginUserHandler,
} from "../controller/user.controller";
const router = express.Router();

router.post(
  "/api/auth/register",
  validateResoure(createUserSchema),
  createCandidateHandler
);

router.post(
  "/api/auth/login",
  validateResoure(loginUserSchema),
  loginUserHandler
);

export default router;

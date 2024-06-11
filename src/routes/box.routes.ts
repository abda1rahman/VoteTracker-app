import express from "express";
import validateResoure from "../middleware/validateResource";
import { createBoxDetailsSchema, createBoxesSchema } from "../schema/box.schema";
import { createBoxHandler, getAllBoxHandler, getBoxById, registerBoxHandler } from "../controller/box.controller";

const router = express.Router();

router.post(
  "/api/developer/registerBox",
  validateResoure(createBoxesSchema),
  registerBoxHandler
);

router.post("/api/developer/createBoxDetails", 
  validateResoure(createBoxDetailsSchema),
  createBoxHandler
)

router.get("/api/getAllBoxes", 
getAllBoxHandler
)

router.get("/api/getBox/:id",
getBoxById
)

export default router;
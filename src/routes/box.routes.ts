import express from "express";
import validateResoure from "../middleware/validateResource";
import { createBoxDetailsSchema, createBoxesSchema, getBoxNameAndCityIdSchema, getBoxesByCitySchema } from "../schema/box.schema";
import { createBoxHandler, getAllBoxesInCityHandler, getBoxByNameAndCityId, registerBoxHandler } from "../controller/box.controller";
import validate from "../middleware/validateResource";

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

router.get("/api/getAllBoxesInCity/:city_id", 
  validate(getBoxesByCitySchema),
  getAllBoxesInCityHandler
)

router.get("/api/getBox",
validate(getBoxNameAndCityIdSchema),
getBoxByNameAndCityId
)

export default router;
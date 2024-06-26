import express from "express";
import validateResoure from "../middleware/validateResource";
import { createBoxMemberSchema, createBoxesSchema, createVoteRecordSchema, getBoxNameAndCityIdSchema, getBoxesByCitySchema } from "../schema/box.schema";
import { createBoxHandler, createVoteRecordHandler, getAllBoxesInCityHandler, getBoxByNameAndCityId, registerBoxHandler } from "../controller/box.controller";
import validate from "../middleware/validateResource";

const router = express.Router();

router.post(
  "/api/developer/registerBox",
  validateResoure(createBoxesSchema),
  registerBoxHandler
);

router.post("/api/developer/createBoxMember", 
  validateResoure(createBoxMemberSchema),
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

router.post('/api/user/createRecord',
  validate(createVoteRecordSchema),
  createVoteRecordHandler
)

export default router;
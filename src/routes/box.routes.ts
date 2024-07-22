import express from "express";
import validateResoure from "../middleware/validateResource";
import { createMemberSchema, createBoxesSchema, createVoteRecordSchema, getBoxNameAndCityIdSchema, getBoxesByCitySchema } from "../schema/box.schema";
import { createMemberHandler, createVoteRecordHandler, getAllBoxesInCityHandler, getBoxByNameAndCityIdHandler, getMemberSearchHandler, registerBoxHandler } from "../controller/box.controller";
import validate from "../middleware/validateResource";

const router = express.Router();

router.post(
  "/api/developer/registerBox",
  validateResoure(createBoxesSchema),
  registerBoxHandler
);

router.post("/api/developer/createBoxMember", 
  validateResoure(createMemberSchema),
  createMemberHandler
)

router.get("/api/getAllBoxesInCity/:city_id", 
  validate(getBoxesByCitySchema),
  getAllBoxesInCityHandler
)

router.get("/api/getBox",
validate(getBoxNameAndCityIdSchema),
getBoxByNameAndCityIdHandler
)

router.post('/api/user/createRecord',
  validate(createVoteRecordSchema),
  createVoteRecordHandler
)

router.get('/api/user/search',
  getMemberSearchHandler
)

export default router;
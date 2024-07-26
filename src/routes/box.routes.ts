import express from "express";
import validateResoure from "../middleware/validateResource";
import {
  createMemberSchema,
  createBoxesSchema,
  createVoteRecordSchema,
  getBoxNameAndCityIdSchema,
  getBoxesByCitySchema,
} from "../schema/box.schema";
import {
  createMemberHandler,
  createVoteRecordHandler,
  exportMembersHandler,
  getAllBoxesInCityHandler,
  getBoxByNameAndCityIdHandler,
  getMemberSearchHandler,
  registerBoxHandler,
} from "../controller/box.controller";
import validate from "../middleware/validateResource";
import { getEnvoyParamsSchema } from "../schema/user.schema";

const router = express.Router();

router.post(
  "/api/boxes",
  validateResoure(createBoxesSchema),
  registerBoxHandler
);

router.post(
  "/api/members",
  validateResoure(createMemberSchema),
  createMemberHandler
);

router.get(
  "/api/boxes/cities/:city_id",
  validate(getBoxesByCitySchema),
  getAllBoxesInCityHandler
);

// Get a box details by name and city_id
router.get(
  "/api/boxes",
  validate(getBoxNameAndCityIdSchema),
  getBoxByNameAndCityIdHandler
);

router.post(
  "/api/records",
  validate(createVoteRecordSchema),
  createVoteRecordHandler
);

router.get('/api/members/export/:envoyId',
  validate(getEnvoyParamsSchema),
  exportMembersHandler)

router.get("/api/users/search", getMemberSearchHandler);

export default router;

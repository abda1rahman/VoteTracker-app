import express, { Request, Response } from "express";
import user from "./user.routes";
import auth from "./auth.routes";

const router = express.Router();

// check if app is working
router.get("/healthcheck", (req: Request, res: Response) => {
  res.json({ message: "everything work correctly" });
});

// Api For Auth
router.use(auth);

// Api For User
router.use(user);


export default router;

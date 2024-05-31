import express, { Request, Response } from "express";

const router = express.Router();

router.get("/me", (req: Request, res: Response) =>
  res.json({ message: "success" })
);

export default router;

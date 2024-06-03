import express, {
  NextFunction,
  Request,
  Response,
} from "express";
import { isCandidateAuth } from "../middleware/auth";
import { log } from "console";
const router = express.Router();



function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}  ${req.url}`);
  next();
}

router.get(
  "/protected",
  isCandidateAuth,
  (req: Request , res) => {
    res.send("Welcome to the protected route");
  }
);

export default router;

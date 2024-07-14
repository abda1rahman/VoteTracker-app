import express from "express";
import cors from "cors";
import cookieParaser from "cookie-parser";

import log from "./utils/logger";
import {connectDB} from "./utils/connect";
import router from "./routes/index";
import dotenv from "dotenv";

const app = express();

dotenv.config();
const port = parseInt(process.env.PORT || "3000");
const host = process.env.HOST || "localhost";
app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParaser());
app.use(router);

app.get("/", (req, res) => {
  res.send(
    '<h1 style="text-align:center; margin-top:5%;">VoteTracker-app (Backend Node js)</h1>'
  );
});

app.listen(port, '0.0.0.0', () => {
  log.info(`Server is running at localhost ${process.env.port}`);

  connectDB();
});

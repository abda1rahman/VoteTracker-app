import express from "express";
import cors from "cors";
import cookieParaser from "cookie-parser";

import log from "./utils/logger";
import connect from "./utils/connect";
import router from "./routes/index";
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParaser());
app.use(router);

app.get("/", (req, res)=> {
  res.send('<h1 style="text-align:center; margin-top:5%;">VoteTracker-app (Backend Node js)</h1>')
})


app.listen(process.env.port, () => {
  log.info(`Server is running at localhost ${process.env.port}`);

  connect();
});

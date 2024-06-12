import express from "express";
import cors from "cors";
import cookieParaser from "cookie-parser";

import log from "./utils/logger";
import connect from "./utils/connect";
import router from "./routes/index";
import dotenv from 'dotenv';

const app = express();

dotenv.config();
const port = process.env.port;


app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParaser());
app.use(router);

app.listen(port, () => {
  log.info(`Server is running at localhost ${port}`);

  connect();
});

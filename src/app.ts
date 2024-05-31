import express from "express";
import config from "config";
import cors from "cors";

import log from "./utils/logger";
import connect from "./utils/connect";
import usersRouter from "./routes/user.routes";

const port = config.get<number>("port");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    credentials: true,
  })
);


app.use('/api/users', usersRouter)

app.listen(port, () => {
  log.info(`Server is running at localhost ${port}`);
  
  connect()
});

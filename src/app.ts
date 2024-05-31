import express from "express";
import config from "config";
import log from "./utils/logger";

const port = config.get<number>("port");
const host = config.get<string>("host");

const app = express();

app.use(express.json());

app.listen(port, () => {
  log.info(`Server is running at localhost ${port}`);
});

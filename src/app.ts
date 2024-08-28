import express from "express";
import cors from "cors";
import cookieParaser from "cookie-parser";

import { connectDB } from "./utils/connect";
import router from "./routes/index.router";
import dotenv from "dotenv";
import { app, server } from "./utils/webSocket"; // diable web socket
import path, { join } from "path";
import log, { morganLogger } from "./utils/logger";

dotenv.config();
const port = process.env.NODE_ENV === "production" ? 80 : 1337;
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);

app.use(morganLogger())

app.use(cookieParaser());

app.use(router);

const filepath = process.env.NODE_ENV === "production" ? "../../client" : "../client"
app.use('/files', express.static(path.join(__dirname, filepath)));

app.use(express.static(join(__dirname, `${filepath}/public`)));


server.listen(port, host, () => {
  log.info(`Server is running at localhost:${host} port: ${port}`);

  connectDB();
});

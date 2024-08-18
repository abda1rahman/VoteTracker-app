import express from "express";
import cors from "cors";
import cookieParaser from "cookie-parser";

import log from "./utils/logger";
import {connectDB} from "./utils/connect";
import router from "./routes/index.router";
import dotenv from "dotenv";
// import {app, server} from "./utils/webSocket"; // diable web socket 
import { join } from "path";


dotenv.config();
const port = process.env.NODE_ENV === 'production' ? 80 : 3000
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost' 

const app = express()

app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParaser());
app.use(router);

// Serve static files from the 'client' directory
app.use(express.static(join(__dirname, '../client/public')));

// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, '../clinet/public', 'index.html'))
// });

app.listen(port, host, () => {
  log.info(`Server is running at localhost:${host} port: ${port}`);

  connectDB();
});

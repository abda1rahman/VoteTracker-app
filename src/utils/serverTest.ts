import express from 'express'
import dotenv from 'dotenv'
import router from '../routes';
dotenv.config();

function createServer(){
  const app = express();
  app.use(express.json());
  app.use(router);

  return app
}

export default createServer

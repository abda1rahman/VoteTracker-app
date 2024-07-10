import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import router from '../routes';
import log from './logger';
dotenv.config();

function createServer(){
  const app = express();
  app.use(express.json());
  app.use(router);


  return app
}

export default createServer

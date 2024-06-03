import { NextFunction, Request, Response, response } from "express";
import { omit } from "lodash";

import { CreateUserInput, loginUserSchema } from "../schema/user.schema";
import log from "../utils/logger";
import candidate, { UserModel } from "../model/candidate.model";
import { generateToken } from "../middleware/jwt";
import { comparePassword } from "../middleware/comparePassword";

export const createCandidateHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) => {
  const { firstName, lastName, password, city_id, phone, ssn } = req.body;

  try {
    const user = await candidate.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
    });

    const candidateUser = candidate.findOne({ ssn });

    if (!!candidateUser) {
      res.status(400).json({ message: "User or SSN already exists" });
    }

    const token = generateToken(user!._id as string, "candidate", res);

    const userJson = {
      ...omit(user.toJSON(), "password"),
      token,
    };
    res.status(201).json(userJson);
  } catch (error: any) {
    log.error(error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "ssn is already exist" });
    }

    res.status(409).send(error.message);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, loginUserSchema>,
  res: Response
) => {
  const { ssn, password } = req.body;
  try {
    const candidateUser = await candidate.findOne({ ssn });
    if (!candidateUser) {
      res.status(401).json({ message: "Invalid ssn or password" });
    }

    const match = await comparePassword(
      password,
      candidateUser?.password ?? ""
    );
    if (!match) {
      res.status(401).json({ message: "Invalid ssn or password" });
    }

    const token = generateToken(candidateUser!._id as string, "candidate", res);

    res.status(200).json({ message: "user login successfully", token });
  } catch (error) {}
};

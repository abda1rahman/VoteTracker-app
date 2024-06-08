import { Request, Response } from "express";
import { omit } from "lodash";

import {
  CreateEnvoyInput,
  CreateUserInput,
  loginUserSchema,
} from "../schema/user.schema";
import log from "../utils/logger";
import { generateToken } from "../middleware/jwt";
import { comparePassword } from "../middleware/comparePassword";
import {
  UsersModel,
  CandidateModel,
  DeveloperModel,
  EnvoyModel,
} from "../model/users.model";
import { Types } from "mongoose";
import { UserModelType } from "../types/user.types";
import { getUserByIdAndRole } from "../service/user.service";

// Resigter Candidate
export const registerCandidateHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) => {
  let { firstName, lastName, password, city_id, phone, ssn, role } = req.body;
  role = role.toLowerCase();
  try {
    const checkUser = await UsersModel.findOne({ ssn });

    if (checkUser) {
      return res.status(400).json({ message: "User or SSN already exists" });
    }
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role,
    });
    if (user) {
      await CandidateModel.create({ candidateId: user._id });
    }
    const token = generateToken(user!._id as Types.ObjectId, "candidate", res);

    const userJson = {
      ...omit(user.toJSON(), "password"),
      token,
    };
    res.status(201).json({data: userJson, message: "User successfully registered", success : true});
  } catch (error: any) {
    log.error(error);

    res.status(409).send(error.message);
  }
};

//Register Envoy
export const registerEnvoyHandler = async (
  req: Request<{}, {}, CreateEnvoyInput>,
  res: Response
) => {
  let { firstName, lastName, password, city_id, phone, ssn, role, boxId, candidateId } = req.body;
  role = role.toLowerCase();
  try {
    const checkUser = await UsersModel.findOne({ ssn });

    if (checkUser) {
      return res.status(400).json({ message: "User or SSN already exists" });
    }

    // check if candidate exist
    const checkCandidate = await CandidateModel.findOne({candidateId: new Types.ObjectId(candidateId)})
    if(!checkCandidate){
      return res.status(400).json({ message: "Candidate does not exist in the system" });
    }

    // should check the box id 
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role,
      boxId,
      candidateId
    });
    if (user) {
      await EnvoyModel.create({ envoyId: user._id, boxId, candidateId });
    }
    const token = generateToken(user!._id as Types.ObjectId, "envoy", res);

    const userJson = {
      ...omit(user.toJSON(), "password"),
      token,
    };
    res.status(201).json(userJson);
  } catch (error: any) {
    log.error(error);

    res.status(409).send(error.message);
  }
};

// Register Developer
export const registerDeveloperHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) => {
  let { firstName, lastName, ssn, password, city_id, phone, role } = req.body;
  role = role.toLowerCase();
  try {
    const checkUser = await UsersModel.findOne({ ssn });
    if (checkUser) {
      return res.status(400).json({ message: "User or SSN already exists" });
    }
    const user = await UsersModel.create({
      firstName,
      lastName,
      ssn,
      phone,
      password,
      city_id,
      role,
    });
    if (user) {
      await DeveloperModel.create({ developerId: user._id });
    }
    res.status(201).json({ message: "developer was created" , success: true});
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login User
export const loginUserHandler = async (
  req: Request<{}, {}, loginUserSchema>,
  res: Response
) => {
  const { ssn, password } = req.body;
  try {
    const user = await UsersModel.findOne({ ssn });
    if (!user) {
      return res.status(401).json({ message: "Invalid ssn or password" });
    }

    const match = await comparePassword(password, user?.password ?? "");
    if (!match) {
      res.status(401).json({ message: "Invalid ssn or password" });
    }
    const token = generateToken(user!._id, user!.role, res);
    
    const getOtherUserField = await getUserByIdAndRole(user.role, user._id, res)
    const mergedUserInfo = {...getOtherUserField, ...user.toJSON(), token}

    res.status(200).json({ message: "user login successfully", success: true, data:  { ...mergedUserInfo } });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

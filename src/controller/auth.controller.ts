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
import { getUserByIdAndRole } from "../service/user.service";
import { BoxesModel } from "../model/box.model";
import { errorResponse, successResponse } from "../utils/apiResponse";

// Resigter Candidate
export const registerCandidateHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) => {
  let { firstName, lastName, city_id, password, phone, ssn } = req.body;
  password = `${ssn}@12`
  try {
    // Check user
    const checkUser = await UsersModel.findOne({ ssn });
    if (checkUser) {
      return res
        .status(400)
        .json(errorResponse(res.statusCode, "User or SSN already exists"));
    }
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role: 'candidate',
    });

    const candidate = await CandidateModel.create({ user_id: user.id });

    const token = generateToken(user!._id as Types.ObjectId, "candidate", res);
    // Format Response
    const userJson = {
      id: candidate!._id,
      ...omit(user.toJSON(), ["password", "id"]),
      token,
    };

    res
      .status(201)
      .json(
        successResponse(
          res.statusCode,
          "User successfully registered",
          userJson
        )
      );
  } catch (error: any) {
    log.error(error);
    return res
      .status(500)
      .json(errorResponse(res.statusCode, "Something went wrong"));
  }
};

//Register Envoy
export const registerEnvoyHandler = async (
  req: Request<{}, {}, CreateEnvoyInput>,
  res: Response
) => {
  let {
    firstName,
    lastName,
    city_id,
    phone,
    ssn,
    password,
    box_id,
    candidate_id,
  } = req.body;
  password = `${ssn}@12`
  try {

    // check box_id available 
    const availableBox = await EnvoyModel.findOne({box_id, candidate_id })
    if(availableBox){
      return res.status(400).json(errorResponse(400, "This box is not available for registration."))
    }

    const checkUser = await UsersModel.findOne({ ssn });
    if (checkUser) {
      return res
        .status(400)
        .json(errorResponse(res.statusCode, "User or SSN already exists"));
    }

    // check if candidate exist
    const checkCandidate: any = await CandidateModel.findById(
      candidate_id
    ).populate("user_id");
    if (!checkCandidate) {
      return res
        .status(400)
        .json(
          errorResponse(
            res.statusCode,
            "candidate_id does not exist in the system"
          )
        );
    }

    // check if box id
    const checkBox = await BoxesModel.findById(box_id);
    if (!checkBox) {
      return res
        .status(400)
        .json(
          errorResponse(res.statusCode, "box_id does not exist in the system")
        );
    }

    // check if envoy and candidate and city_id in the same city
    if (
      !(
        city_id === checkCandidate!.user_id!.city_id &&
        city_id === checkBox.city_id
      )
    ) {
      return res
        .status(400)
        .json(
          errorResponse(
            res.statusCode,
            "The city_id of the envoy does not match the city_id of the candidate and the box."
          )
        );
    }

    // Create user
    const user = await UsersModel.create({
      firstName,
      lastName,
      password,
      ssn,
      phone,
      city_id,
      role: "envoy",
    });

    // Create envoy
    const envoy = await EnvoyModel.create({
      user_id: user._id,
      box_id: new Types.ObjectId(box_id),
      candidate_id: new Types.ObjectId(candidate_id),
    });
    // Create token
    const token = generateToken(envoy!._id as Types.ObjectId, "envoy", res);

    // Format response
    const userJson = {
      id: envoy._id,
      ...omit(user.toJSON(), ["password", "id"]),
      token,
    };

    res
      .status(201)
      .json(
        successResponse(res.statusCode, "envoy created successfully", userJson)
      );
  } catch (error: any) {
    log.error(error);
    return res
      .status(500)
      .json(errorResponse(res.statusCode, "Something went wrong"));
  }
};

// Register Developer
export const registerDeveloperHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) => {
  let { firstName, lastName, ssn, password, city_id, phone } = req.body;
  password = `${ssn}@12`
  try {
    const checkUser = await UsersModel.findOne({ ssn });
    if (checkUser) {
      return res
        .status(400)
        .json(errorResponse(res.statusCode, "User or SSN already exists"));
    }

    const user = await UsersModel.create({
      firstName,
      lastName,
      ssn,
      phone,
      password,
      city_id,
      role: 'developer',
    });

    const developer = await DeveloperModel.create({ user_id: user._id });

    const infoJson = {
      ...omit(user.toJSON, ["password", "id"]),
    };
    res
      .status(201)
      .json(
        successResponse(
          res.statusCode,
          "Developer created successfully",
          infoJson
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(res.statusCode, "Internal server error"));
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
      return res
        .status(401)
        .json(errorResponse(res.statusCode, "Invalid ssn or password"));
    }
    const match = await comparePassword(password, user?.password ?? "");
    if (!match) {
      return res
        .status(401)
        .json(errorResponse(res.statusCode, "Invalid ssn or password"));
    }

    const token = generateToken(user!.id, user!.role, res);
    const getOtherUserField = await getUserByIdAndRole(user.role, user.id);

    const mergedUserInfo = {
      ...getOtherUserField,
      ...omit(user.toJSON(), ["password", "id"]),
      token,
    };

    res
      .status(200)
      .json(
        successResponse(
          res.statusCode,
          "user login successfully",
          mergedUserInfo
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse(res.statusCode, "Internal server error", error));
  }
};

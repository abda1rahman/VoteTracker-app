import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CandidateModel, EnvoyModel, UsersModel } from "../model/users.model";
import City from "../model/city.model";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";
import { UpdateEnovyInput } from "../schema/user.schema";
import { BoxesModel } from "../model/box.model";

export const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let Person;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "the given Id is wrong" });
    }

    Person = await EnvoyModel.findById(id);

    if (!Person) {
      Person = await CandidateModel.findById(id);
    }

    if (!Person) {
      return res
        .status(404)
        .json({ success: false, message: "This Id does not exist " });
    }

    const User = await UsersModel.findById(Person.user_id);

    switch (User!.role) {
      case "envoy":
        await UsersModel.findByIdAndDelete(User?._id);
        await EnvoyModel.findByIdAndDelete(Person._id);
        break;
      case "candidate":
        await UsersModel.findByIdAndDelete(User?._id);
        await CandidateModel.findByIdAndDelete(Person._id);
        break;
      default:
        null;
    }

    return res
      .status(200)
      .json({ success: true, message: "The User is Deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

// Update envoy
export const updateEnvoyHandler = async (
  req: Request<{}, {}, UpdateEnovyInput>,
  res: Response
) => {
  try {
    const {
      firstName,
      lastName,
      password,
      phone,
      ssn,
      newSSN
    } = req.body;

    // check if User envoy exist
    const user = await UsersModel.findOne({ ssn, role: "envoy" });
    if (!user) {
      return res
        .status(404)
        .json(errorResponse(res.statusCode, "No envoy found with this SSN"));
    }

    // Validate and update field if provided
    let updatedUserData: any = {
      firstName,
      lastName,
      password,
      phone,
    };

    if(newSSN){
      updatedUserData.ssn = newSSN
    }

    // Perform the update
      const updatedUser = await UsersModel.updateOne(
        { _id: user._id },
        updatedUserData
      );
      
    return res.status(200).json(successResponse(res.statusCode, "envoy updated successfully", updatedUser ));
  } catch (error) {
    log.error(error);
    return res
      .status(500)
      .json(errorResponse(res.statusCode, "something went wrong"));
  }
};

// Get All City
export const getAllCityHandler = async (req: Request, res: Response) => {
  try {
    const allCity = await City.find();
    res.status(200).json(successResponse(res.statusCode, "All City", allCity));
  } catch (error) {
    log.info(error);
    return res
      .status(500)
      .json(errorResponse(res.statusCode, "Something went wrong"));
  }
};

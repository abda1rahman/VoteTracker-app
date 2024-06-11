import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CandidateModel, EnvoyModel, UsersModel } from "../model/users.model";

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
      case "enovy":
        await UsersModel.findByIdAndDelete(User?._id);
        await EnvoyModel.findByIdAndDelete(Person._id);
        break;
      case "candidate":
        await UsersModel.findByIdAndDelete(User?._id);
        await CandidateModel.findByIdAndDelete(Person._id);
        break;
      default: null;
    }

    return res.status(200).json({success: true, message: "The User is Deleted successfully"})
  } catch (error) {
    return res.status(500).json({success: false, message: "Something went wrong"})
  }
};

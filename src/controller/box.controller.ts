import { Request, Response } from "express";
import { BoxDetailsInput, BoxesInput } from "../schema/box.schema";
import { BoxesModel, BoxesType, BoxDetailsModel } from "../model/box.model";
import { Types, isValidObjectId } from "mongoose";
import City from "../model/city.model";

export const registerBoxHandler = async (
  req: Request<{}, {}, BoxesInput>,
  res: Response
) => {
  const { log, lat, city_id, boxName } = req.body;
  try {
    const checkBoxExist = await BoxesModel.findOne({ city_id, boxName });
    if (checkBoxExist) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Box Name already exists in the same city",
        });
    }
    const box: BoxesType = await BoxesModel.create({
      log,
      lat,
      boxName,
      city_id,
    });

    res
      .status(201)
      .json({ success: true, message: "Box created successfully", box });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong while register box",
        error,
      });
  }
};

// Create Box Details 
export const createBoxHandler = async (
  req: Request<{}, {}, BoxDetailsInput>,
  res: Response
) => {
  const { boxName, firstName, lastName, city_id } = req.body;

  try {
    // check if box_id exist
    const checkBox = await BoxesModel.findOne({ boxName, city_id });
    if (!checkBox) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Box with city_id or boxName does not exist",
        });
    }
    // Create box details
    const boxDetails = await BoxDetailsModel.create({
      box_id: checkBox.id,
      boxName,
      firstName,
      lastName,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Box details created successfully",
        boxDetails,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get all boxes 
export const getAllBoxHandler = async (req: Request, res: Response) => {
  try {
    const allBox = await BoxesModel.aggregate([
      { $lookup: { from: "city", localField: "city_id", foreignField: "city_id", as: "city" }},
      { $unwind: "$city" },
      { $addFields: { id: "$_id", city: "$city.name" } },
      { $project: { _id:0, __v:0} },
    ]);
    res.status(200).json({ success: true, allBox });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get box by Id 
export const getBoxById = async(req: Request, res: Response) => {
  const {id} = req.params
  try {
    if(!isValidObjectId(id)){
      return res.status(400).json({success: false, message: "Id is not vaild"})
    }
    const boxDetails = await BoxDetailsModel.find({box_id: id}).select('-_id')
    res.status(200).json({success: true, boxDetails})
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Edit box 


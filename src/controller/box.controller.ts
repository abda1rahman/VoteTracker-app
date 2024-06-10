import { Request, Response } from "express";
import {BoxDetailsInput, BoxesInput} from "../schema/box.schema"
import { BoxesModel, BoxesType, BoxDetailsModel } from "../model/box.model";
import { Types } from "mongoose";

export const registerBoxHandler = async(req: Request<{},{},BoxesInput>, res: Response) => {
  const {log, lat, city_id, boxName} = req.body;
  try {

    const checkBoxExist = await BoxesModel.findOne({city_id, boxName})
    if(checkBoxExist){
      return res.status(400).json({success: false, message: "Box Name already exists in the same city"})
    }
    const box: BoxesType = await BoxesModel.create({log, lat, boxName, city_id})
    
    res.status(201).json({success: true, message: "Box created successfully",box })
  } catch (error) {
    res.status(500).json({success:false, message:"Something went wrong while register box", error})
  }
}

export const createBoxHandler = async(req: Request<{},{},BoxDetailsInput>, res: Response) => {
  const {box_id, boxName, firstName, lastName} = req.body;

  try {
    // check if box_id exist
    const checkBox = await BoxesModel.findOne({boxName, _id: new Types.ObjectId(box_id)});
    if(!checkBox){
      return res.status(400).json({success: false, message: "Box with given ID or boxName does not exist"})
    }
    // Create box details 
    const boxDetails = await BoxDetailsModel.create({box_id, boxName, firstName, lastName})

    res.status(201).json({success: true, message:"Box details created successfully", boxDetails})
  } catch (error) {
    return res.status(500).json({success: false, message:"Internal server error"})
  }
}
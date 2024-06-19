import { Request, Response } from "express";
import { BoxDetailsInput, BoxParamsInput, BoxesInput } from "../schema/box.schema";
import { BoxesModel, BoxesType, BoxDetailsModel } from "../model/box.model";
import City from "../model/city.model";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";

export const registerBoxHandler = async (
  req: Request<{}, {}, BoxesInput>,
  res: Response
) => {
  const { log, lat, city_id, boxName } = req.body;
  try {
    // Get city
    const cityJordan = await City.findOne({city_id})

    // Check box name and city_id
    const checkBoxExist = await BoxesModel.findOne({ city_id, boxName });
    if (checkBoxExist) {
      return res.status(400).json(errorResponse(res.statusCode, `Box Name or city_id already exists in ${cityJordan!.city}`));
    }

    // Create box 
    const box: BoxesType = await BoxesModel.create({
      log,
      lat,
      boxName,
      city_id,
    });

    res.status(201).json(successResponse(res.statusCode, "Box created successfully", {...box.toJSON(),city: cityJordan!.city} ));

  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse(res.statusCode, "Something went wrong while register box", error));
  }
};

// Create Box Details 
export const createBoxHandler = async (
  req: Request<{}, {}, BoxDetailsInput>,
  res: Response
) => {
  const { boxName, firstName, lastName, ssn, city_id } = req.body;

  try {

    // check if box_id and boxName exist in boxes
    const checkBox = await BoxesModel.findOne({ boxName, city_id });
    if (!checkBox) {
      return res.status(400).json(errorResponse(res.statusCode, "Failed to register box details. No matching box was found with the provided boxName and city_id."));
    }

    // check if social number is already exist in same box
    const checkBoxDetails = await BoxDetailsModel.findOne({ssn})
    if(checkBoxDetails){
      return res.status(400).json(errorResponse(res.statusCode, "ssn => social security number already exists in the same box details."));
    }

    // Create box details
    const boxDetails = await BoxDetailsModel.create({
      box_id: checkBox.id,
      boxName,
      firstName,
      lastName,
      ssn,
    });

    res.status(201).json(successResponse(res.statusCode, "Box details created successfully", boxDetails));

  } catch (error) {
    log.error(error);
    return res.status(500).json(errorResponse(res.statusCode, "Internal server error"));
  }
};

// Get all boxes 
export const getAllBoxesInCityHandler = async (req: Request<BoxParamsInput>, res: Response) => {
  try {
    const {city_id} = req.params;

    // Get all Boxes in specific city_id 
    const allBox = await BoxesModel.aggregate([
      {$match: {city_id: parseInt(city_id)}},
      { $lookup: { from: "cities", localField: "city_id", foreignField: "city_id", as: "city" }},
      { $unwind: "$city" },
      { $addFields: { id: "$_id", city: "$city.city" } },
      { $project: { _id:0, __v:0} },
    ]);

    // Check if no boxes were found
    if(allBox.length === 0){
      return res.status(404).json(errorResponse(res.statusCode, "No boxes found for this city_id"))
    }

    // Respond with the retrieved boxes
    res.status(200).json(successResponse(res.statusCode, "All Boxes", allBox))
  } catch (error) {
    log.error(error)
    return res.status(500).json(errorResponse(res.statusCode, "Internal server error"));
  }
};

// Get box by boxName & city_id query
export const getBoxByNameAndCityId = async(req: Request, res: Response) => {
  const {boxName, city_id} = req.query
  try {
    
    // check if box_id and boxName exist in boxes
    const checkBox = await BoxesModel.findOne({ boxName, city_id })
    if (!checkBox) {
      return res.status(400).json(errorResponse(res.statusCode, "Box with city_id or boxName does not exist"));
    }

    const boxDetails = await BoxDetailsModel.find({box_id: checkBox.id}).select('-id -box_id -boxName -_id')

    if(!boxDetails){
      return res.status(404).json(errorResponse(res.statusCode, `Not found any details in ${boxName}`))
    }

    // Format the response
    const response = {
      boxInfo: {
        id: checkBox.id,
        boxName: checkBox.boxName,
        log: checkBox.log,
        lat: checkBox.lat,
        city_id: checkBox.city_id
      },
      boxDetails: [...boxDetails]
    }

    res.status(200).json(successResponse(res.statusCode, "Box details", response))

  } catch (error) {
    log.error(error);
    return res.status(500).json(errorResponse(res.statusCode, "something went wrong"));
  }
}

// Edit box 


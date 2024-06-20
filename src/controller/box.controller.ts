import { Request, Response } from "express";
import { BoxMemberInput, BoxParamsInput, BoxesInput, VoteRecordInput } from "../schema/box.schema";
import { BoxesModel, BoxesType, BoxMemberModel, VoteRecordModel } from "../model/box.model";
import City from "../model/city.model";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";
import { EnvoyModel, EnvoyModelType } from "../model/users.model";
import path from "path";

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
      return res.status(400).json(errorResponse(400, `Box Name or city_id already exists in ${cityJordan!.city}`));
    }

    // Create box 
    const box: BoxesType = await BoxesModel.create({
      log,
      lat,
      boxName,
      city_id,
    });

    res.status(201).json(successResponse(201, "Box created successfully", {...box.toJSON(),city: cityJordan!.city} ));

  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse(500, "Something went wrong while register box", error));
  }
};

// Create Box Member 
export const createBoxHandler = async (
  req: Request<{}, {}, BoxMemberInput>,
  res: Response
) => {
  const { boxName, firstName, lastName, ssn, city_id } = req.body;

  try {

    // check if box_id and boxName exist in boxes
    const checkBox = await BoxesModel.findOne({ boxName, city_id });
    if (!checkBox) {
      return res.status(404).json(errorResponse(400, "Failed to register box member. No matching box was found with the provided boxName and city_id."));
    }

    // check if social number is already exist in same box
    const checkBoxMember = await BoxMemberModel.findOne({ssn})
    if(checkBoxMember){
      return res.status(400).json(errorResponse(400, "ssn => social security number already exists in the same box member."));
    }

    // Create box member
    const boxMember = await BoxMemberModel.create({
      box_id: checkBox.id,
      boxName,
      firstName,
      lastName,
      ssn,
    });

    res.status(201).json(successResponse(201, "Box member created successfully", boxMember));

  } catch (error) {
    log.error(error);
    return res.status(500).json(errorResponse(500, "Internal server error"));
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
      return res.status(404).json(errorResponse(404, "No boxes found for this city_id"))
    }

    // Respond with the retrieved boxes
    res.status(200).json(successResponse(200, "All Boxes", allBox))
  } catch (error) {
    log.error(error)
    return res.status(500).json(errorResponse(500, "Internal server error"));
  }
};

// Get box by boxName & city_id query
export const getBoxByNameAndCityId = async(req: Request, res: Response) => {
  const {boxName, city_id} = req.query
  try {
    
    // check if box_id and boxName exist in boxes
    const checkBox = await BoxesModel.findOne({ boxName, city_id })
    if (!checkBox) {
      return res.status(404).json(errorResponse(404, "Box with city_id or boxName does not exist"));
    }

    const boxMember = await BoxMemberModel.find({box_id: checkBox.id}).select('-id -box_id -boxName -_id')

    if(!boxMember){
      return res.status(404).json(errorResponse(404, `Not found any member in ${boxName}`))
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
      boxMember: [...boxMember]
    }

    res.status(200).json(successResponse(200, "Box member", response))

  } catch (error) {
    log.error(error);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
}

// Create Vote Record 
export const createVoteRecordHandler = async(req:Request<{},{},VoteRecordInput>, res:Response) =>{
  try {
    const {state, envoy_id, box_member_id} = req.body
    
    // Check if envoy exists
    const envoy = await EnvoyModel.findById(envoy_id)
    if(!envoy){
      return res.status(404).json(errorResponse(404, "enovy not found"))
    }

    // Check if vote record already exists, update if found
    const voteRecord = await VoteRecordModel.findOneAndUpdate(
      { candidate: envoy.candidate_id, boxMember: box_member_id },
      { state },
      { new: true, upsert: true }
    );

    // Check if voteRecord was found and updated
  if (voteRecord) {
    return res.status(200).json(successResponse(200, "Vote updated successfully", voteRecord));
  }

    // Check if id member exists
    const boxMember = await BoxMemberModel.findById(box_member_id);
    if(!boxMember){
      return res.status(404).json(errorResponse(404, "box_member_id does not found"))
    }

    // Create new vote record if not found
    const newVoteRecord  = await VoteRecordModel.create({
      state,
      enovy: envoy._id,
      candidate: envoy.candidate_id,
      boxMember: boxMember._id
    })

    return res.status(201).json(successResponse(201, "vote created successfully", newVoteRecord))
  } catch (error) {
    log.error("Error creating/updating vote record:", error);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
}


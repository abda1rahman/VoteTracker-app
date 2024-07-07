import { Request, Response } from "express";
import { BoxMemberInput, BoxParamsInput, BoxQueryInput, BoxesInput, VoteRecordInput } from "../schema/box.schema";
import { BoxesModel, BoxesType, BoxMemberModel, VoteRecordModel, VoteRecordType } from "../model/box.model";
import City from "../model/city.model";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";
import { EnvoyModel, EnvoyModelType } from "../model/users.model";
import { Types } from "mongoose";

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

    // check if member exist 
    const member = await BoxMemberModel.findOne({ssn})
    if(member){
      return res.status(400).json(errorResponse(400, "ssn => social security number already exists in the same box member."));
    }

    // check if box_id and boxName exist in boxes
    const box = await BoxesModel.findOne({ boxName, city_id });
    if (!box) {
      return res.status(404).json(errorResponse(400, "Failed to register box member. No matching box was found with the provided boxName and city_id."));
    }


    // Create box member
    const boxMember = await BoxMemberModel.create({
      box_id: box.id,
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

// Get Box By boxName & city_id query
export const getBoxByNameAndCityId = async(req: Request<{},{},{},BoxQueryInput>, res: Response) => {
  const {boxName, city_id} = req.query
  const city_Id = Number(city_id)
  try {

    // check if box_id and boxName exist and add city
    const box: any = await BoxesModel.aggregate([
      {$match: { boxName, city_id: city_Id } },
      {$lookup: {from: "cities", localField: "city_id", foreignField: "city_id", as: "city"}},
      {$unwind: '$city'},
      {$addFields: {city: {city_id: '$city.city_id', cityName: '$city.city'}}},
      {$project: {_id:0, id:'$_id', log:1, lat:1, boxName:1, city:{city_id:'$city.city_id', cityName: '$city.cityName'}}}
    ])

    if (box.length === 0) {
      return res.status(404).json(errorResponse(404, "Box with city_id or boxName does not exist"));
    }

    const boxMember = await BoxMemberModel.find({box_id: box[0].id})
    if(!boxMember){
      return res.status(404).json(errorResponse(404, `Not found any member in ${boxName}`))
    }

    // Format the response
    const response = {
      boxInfo: box,
      members: [...boxMember]
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
    const {state, envoy_id, member_id} = req.body
    
    const [envoy, member] = await Promise.all([
      EnvoyModel.findById(envoy_id),
      BoxMemberModel.findById(member_id)
    ])

    // Check if envoy exists
    if(!envoy){
      return res.status(404).json(errorResponse(404, "enovy not found"))
    }
    
    // Check if member_id exists
    if(!member){
      return res.status(404).json(errorResponse(404, "member_id does not found"))
    }

    // Check if member and envoy follow the same box_id 
    if(member.box_id.toString() !== envoy.box_id.toString()){
      return res.status(400).json(errorResponse(404, 'Member and envoy do not share the same box_id'))
    }

    const filter = {envoy_id: new Types.ObjectId(envoy_id), member_id: new Types.ObjectId(member_id)};
    const update = {state}
    const options = {new: true, upsert: true,  setDefaultsOnInsert: true}
    
    // Check if vote record already exists update if not created
    const updateVoteRecord = await VoteRecordModel.findOneAndUpdate(filter, update, options);

    const message = updateVoteRecord?.createdAt.getTime() === updateVoteRecord?.updatedAt.getTime() 
    ? "Vote created successfully"
    : "Vote updated successfully"
  
  return res.status(200).json(successResponse(200, message, updateVoteRecord));
  } catch (error) {
    log.error("Error creating/updating vote record:", error);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
}

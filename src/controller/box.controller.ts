import { Request, Response } from "express";
import { BoxMemberInput, BoxParamsInput, BoxQueryInput, BoxesInput, VoteRecordInput } from "../schema/box.schema";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";
import { findCity, findEnvoyAndMember } from "../service/user.service";
import { createBox, createMember, findBox, findMemberBySsn, getAllBoxes, getBoxByNameAndCity_id, updateVoteRecord } from "../service/box.service";

export const registerBoxHandler = async (
  req: Request<{}, {}, BoxesInput>,
  res: Response
) => {
  const { log, lat, city_id, boxName } = req.body;
  try {
    // Get city
    const cityJordan = await findCity(city_id)

    // Check box name and city_id
    const checkBoxExist = await findBox(city_id, boxName)
    if (checkBoxExist) {
      return res.status(400).json(errorResponse(400, `Box Name or city_id already exists in ${cityJordan!.city}`));
    }

    // Create box 
    const box = await createBox({log, lat, boxName, city_id})

    res.status(201).json(successResponse(201, "Box created successfully", {...box,city: cityJordan!.city} ));

  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse(500, "Something went wrong while register box", error));
  }
};

// Register Member in box
export const createMemberHandler = async (
  req: Request<{}, {}, BoxMemberInput>,
  res: Response
) => {
  const { boxName, firstName, lastName, ssn, city_id } = req.body;

  try {

    // check if member exist 
    const member = await findMemberBySsn(ssn)
    if(member){
      return res.status(400).json(errorResponse(400, "ssn => social security number already exists in the same box member."));
    }
    // check if box_id and boxName exist in boxes
    const box =     await findBox(city_id, boxName)
    if (!box) {
      return res.status(404).json(errorResponse(400, "Failed to register box member. No matching box was found with the provided boxName and city_id."));
    }

    
    // Create box member
    const Member = await createMember(firstName, lastName, ssn, boxName, box.id)

    res.status(201).json(successResponse(201, "Box member created successfully", Member));

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
    const allBox = await getAllBoxes(city_id)

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
export const getBoxByNameAndCityIdHandler = async(req: Request<{},{},{},BoxQueryInput>, res: Response) => {
  const {boxName, city_id} = req.query
  const city_Id = Number(city_id)
  try {
    // get boxInfo and members
    const box = await getBoxByNameAndCity_id(boxName, city_Id)

    res.status(200).json(successResponse(200, "Box member", box))

  } catch (error) {
    log.error(error);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
}

// Create Vote Record 
export const createVoteRecordHandler = async(req:Request<{},{},VoteRecordInput>, res:Response) =>{
  try {
    const {state, envoy_id, member_id} = req.body
    
    const {envoy, member}:any = await findEnvoyAndMember(envoy_id, member_id)

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
    
    // Check if vote record already exists update if not created    
    const VoteRecord = await updateVoteRecord(envoy_id, member_id, state)

    const message = VoteRecord?.createdAt.getTime() === VoteRecord?.updatedAt.getTime() 
    ? "Vote created successfully"
    : "Vote updated successfully"
  
  return res.status(200).json(successResponse(200, message, VoteRecord));
  } catch (error) {
    log.error("Error creating/updating vote record:", error);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
}

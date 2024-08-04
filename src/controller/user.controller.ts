import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CandidateModel, UsersModel, EnvoyModelType } from "../model/users.model";
import City from "../model/city.model";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";
import { CandidateParamsInput, UpdateEnovyInput } from "../schema/user.schema";
import { deleteCandidateById, deleteEnvoyById, findCandidateById, findEnvoyById, findEnvoyByRole, getAllCandidate, getAllEnvoy, getEnvoyByCandidateId, getEnvoyVoteInfo, updateEnvoyData } from "../service/user.service";

export const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let Person;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "the given Id is wrong" });
    }

    Person = await findEnvoyById(id)

    if (!Person) {
      Person = await findCandidateById(id)
    }

    if (!Person) {
      return res.status(404).json({ success: false, message: "This Id does not exist " });
    }

    const User = await UsersModel.findById(Person.user_id);

    switch (User!.role) {
      case "envoy":
        await deleteEnvoyById(User?.id, Person.id)
        break;
      case "candidate":
        await deleteCandidateById(User?.id, Person.id)
        break;
    }

    return res.status(200).json({ success: true, message: "The User is Deleted successfully" });
  } catch (error:any) {
    log.error('Error in controller deleteUserById', error.message)
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
    const user = await findEnvoyByRole(ssn)
    if (!user) {
      return res.status(404).json(errorResponse(res.statusCode, "No envoy found with this SSN"));
    }

    const updatedEnvoy = await updateEnvoyData({firstName, lastName, password, phone, user_id:user.id, newSSN})
      
    return res.status(200).json(successResponse(res.statusCode, "envoy updated successfully", updatedEnvoy ));
  } catch (error:any) {
    log.error('Error in controller updateEnvoyHandler', error.message)
    return res.status(500).json(errorResponse(res.statusCode, "something went wrong"));
  }
};

// Get All City
export const getAllCityHandler = async (req: Request, res: Response) => {
  try {
    const allCity = await City.find();
    res.status(200).json(successResponse(res.statusCode, "All City", allCity));
  } catch (error:any) {
    log.error('Error in controller getAllCityHandler', error.message)
    return res.status(500).json(errorResponse(res.statusCode, "Something went wrong"));
  }
};

// Get All Candidate
export const getAllCandidateHandler = async(req:Request, res:Response) => {
  try {
    const allCandidate = await getAllCandidate()

    return res.status(200).json(successResponse(res.statusCode, "All Candidate", allCandidate))
  } catch (error:any) {
    log.error('Error in controller getAllCandidateHandler', error.message)
    return res.status(500).json(errorResponse(res.statusCode, "Something went wrong"));
}
  }

// Get All Envoy By Candidate Id
export const getEnvoyByCandidateIdHandler = async(req:Request<CandidateParamsInput>, res:Response) => {
  try {
    let {candidate_id} = req.params;
    
    // get candidate
    const candidate = await CandidateModel.findById(candidate_id)
    if(!candidate){
      return res.status(404).json(errorResponse(404, "Candidate not found"))
    }
    
    // Get all envoy by candidate id 
    const allEnvoy: EnvoyModelType[] = await getEnvoyByCandidateId(candidate.id)

    if(allEnvoy.length === 0){
      return res.status(404).json(errorResponse(404, "cannot find any enovy for this candidate"))
    }

    return res.status(200).json(successResponse(200, `All enovy for candidate`, allEnvoy))
  } catch (error:any) {
    log.error('Error in controller getEnvoyByCandidateIdHandler', error.message)
    return res.status(500).json(errorResponse(500, "Something went wrong"));
}
}

// Get All Envoy
export const getAllEnvoyHandler = async(req:Request, res:Response) => {
  try {
    // get all enovy
    const allEnvoy = await getAllEnvoy()

    // if not found any envoy
    if(allEnvoy.length === 0){
      return res.status(404).json(errorResponse(404, "cannot find any enovy for this candidate"))
    }

    res.status(200).json(successResponse(res.statusCode, "All Envoy", allEnvoy));
  } catch (error:any) {
    log.error('Error in controller getAllEnvoyHandler', error.message)
    return res.status(500).json(errorResponse(res.statusCode, "Something went wrong"));
  }
}

export const getEnvoyDetails1Handler = async(req:Request, res:Response) => {
  try {
    const {envoyId} = req.params

    const envoy = await getEnvoyVoteInfo(envoyId)
    
    res.status(200).json(successResponse(200, 'envoy details', envoy))
  } catch (error:any) {
    log.error('Error in controller getEnvoyDetails1Handler', error.message)
    return res.status(500).json(errorResponse(res.statusCode, "Something went wrong"));
  }
}


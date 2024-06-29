import { Request, Response } from "express";
import { Types, isValidObjectId } from "mongoose";
import { CandidateModel, EnvoyModel, UsersModel, EnvoyModelType, UserModelType } from "../model/users.model";
import City from "../model/city.model";
import { errorResponse, successResponse } from "../utils/apiResponse";
import log from "../utils/logger";
import { CandidateParamsInput, UpdateEnovyInput } from "../schema/user.schema";

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

// Get All Candidate
export const getAllCandidateHandler = async(req:Request, res:Response) => {
  try {
    const allCandidate = await CandidateModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "users"
        }
      },
      { $unwind: "$users" },
      {
        $lookup: {
          from: "cities", // Name of the collection to join with
          localField: "users.city_id", // Field from the local (UsersModel) collection
          foreignField: "city_id", // Field from the foreign (cities) collection
          as: "city" // Name for the output array field
        }
      },
      { $unwind: "$city" },
      {
        $addFields: {
          city: {
            city_id: "$city.city_id",
            cityName: "$city.city"
          } // Extract the 'city' field from the 'city' document
        }
      },
      {
        $project: {
          _id:0,
          id: {$toString: '$_id'},
          firstName: '$users.firstName',
          lastName: '$users.lastName',
          ssn: '$users.ssn',
          phone: '$users.phone',
          city: {cityName: 1, city_id: 1},
          role: '$users.role',
          
        }
      }
    ]);
    
    return res.status(200).json(successResponse(res.statusCode, "All Candidate", allCandidate))
  } catch (error) {
    log.error(error)
    return res
    .status(500)
    .json(errorResponse(res.statusCode, "Something went wrong"));
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
    const allEnvoy: EnvoyModelType[] = await EnvoyModel.aggregate([
      {$match: {candidate_id: new Types.ObjectId(candidate_id)}},
      {$lookup: {from: 'users', localField: 'user_id', foreignField: '_id', as: 'users'}},
      {$unwind: '$users'},
      {$lookup: {from: 'cities', localField: 'users.city_id', foreignField:'city_id', as: 'city'}},
      {$unwind: '$city'},
      {$addFields: {city: {city_id:'$city.city_id', cityName:'$city.city'}}},
      {$project: {id:'$_id', _id: 0, candidate_id:1, firstName:'$users.firstName', lastName:'$users.lastName',
        ssn:'$users.ssn', phone:'$users.phone', role:'$users.role', city:{city_id:1, cityName:1}, } }
    ])
    if(allEnvoy.length === 0){
      return res.status(404).json(errorResponse(404, "cannot find any enovy for this candidate"))
    }


    return res.status(200).json(successResponse(200, `All enovy for candidate`, allEnvoy))
  } catch (error) {
    log.error(error)
    return res.status(500).json(errorResponse(500, "Something went wrong"));
}
}

// Get All Envoy
export const getAllEnvoyHandler = async(req:Request, res:Response) => {
  try {
    // get all enovy
    const allEnvoy = await EnvoyModel.aggregate([
      {$lookup: {from:'users', localField:'user_id', foreignField:'_id', as:'users'}},
      {$unwind: '$users'},
      {$lookup: {from:'cities', localField:'users.city_id', foreignField:'city_id', as:'city'}},
      {$unwind: '$city'},
      {$addFields: {city: {city_id:'$city.city_id', cityName:'$city.city'}}},
      {$project: {id:'$_id', _id: 0, candidate_id:1, firstName:'$users.firstName', lastName:'$users.lastName',
        ssn:'$users.ssn', phone:'$users.phone', role:'$users.role', city:{city_id:1, cityName:1}, } }
    ])

    // if not found any envoy
    if(allEnvoy.length === 0){
      return res.status(404).json(errorResponse(404, "cannot find any enovy for this candidate"))
    }

    res.status(200).json(successResponse(res.statusCode, "All Envoy", allEnvoy));
  } catch (error) {
    log.info(error);
    log.info(error)
    return res.status(500).json(errorResponse(res.statusCode, "Something went wrong"));
  }
}
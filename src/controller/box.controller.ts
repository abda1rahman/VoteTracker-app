import { Request, Response } from "express";
import {
  MemberInput,
  BoxParamsInput,
  BoxQueryInput,
  BoxesInput,
  VoteRecordInput,
  SearchQueryInput,
} from "../schema/box.schema";
import { errorResponse, successResponse } from "../utils/apiResponse";
import logger from "../utils/logger/index";
import { findCity, findEnvoyAndMember } from "../service/user.service";
import {
  createBox,
  createMember,
  getMembersDataVote,
  findBox,
  findMemberBySsn,
  getAllBoxes,
  getBoxByNameAndCity_id,
  searchQueryMember,
  updateVoteRecord,
  findRecordMember,
} from "../service/box.service";
import { exportExcel } from "../utils/exportExcel";
import {
  checkExistCacheMember,
  createIndexMember,
  searchHashMember,
  setCacheHashMember,
} from "../redis/MemberSearch";
import { IMemberSearch } from "../service/types";
import { updateCacheRecord } from "../redis/trackRecods";
import { emitWebSocketEvent, io, socketCandidtes } from "../utils/webSocket";

// Register Box
export const registerBoxHandler = async (
  req: Request<{}, {}, BoxesInput>,
  res: Response
) => {
  const { log, lat, city_id, boxName } = req.body;
  try {
    // Get city
    const cityJordan = await findCity(city_id);

    // Check box name and city_id
    const checkBoxExist = await findBox(city_id, boxName);
    if (checkBoxExist) {
      return res
        .status(400)
        .json(
          errorResponse(
            400,
            `Box Name or city_id already exists in ${cityJordan!.city}`
          )
        );
    }

    // Create box
    const box = await createBox({ log, lat, boxName, city_id });

    res.status(201).json(
      successResponse(201, "Box created successfully", {
        ...box,
        city: cityJordan!.city,
      })
    );
  } catch (error: any) {
    logger.error("Error in controller registerBoxHandler", error.message);
    return res
      .status(500)
      .json(
        errorResponse(500, "Something went wrong while register box", error)
      );
  }
};

// Register Member in box
export const createMemberHandler = async (
  req: Request<{}, {}, MemberInput>,
  res: Response
) => {
  const {
    boxName,
    firstName,
    secondName,
    thirdName,
    lastName,
    ssn,
    city_id,
    identity,
  } = req.body;

  try {
    // check if member exist
    const member = await findMemberBySsn(ssn);
    if (member) {
      return res
        .status(400)
        .json(
          errorResponse(
            400,
            "ssn => social security number already exists in the same box member."
          )
        );
    }
    // check if box_id and boxName exist in boxes
    const box = await findBox(city_id, boxName);
    if (!box) {
      return res
        .status(404)
        .json(
          errorResponse(
            400,
            "Failed to register box member. No matching box was found with the provided boxName and city_id."
          )
        );
    }

    // Create box member
    const Member = await createMember(
      firstName,
      secondName,
      thirdName,
      lastName,
      ssn,
      boxName,
      box.id,
      identity
    );

    res
      .status(201)
      .json(successResponse(201, "Box member created successfully", Member));
  } catch (error: any) {
    logger.error("Error in controller createMemberHandler", error.message);
    return res.status(500).json(errorResponse(500, "Internal server error"));
  }
};

// Get all boxes
export const getAllBoxesInCityHandler = async (
  req: Request<BoxParamsInput>,
  res: Response
) => {
  try {
    const { city_id } = req.params;

    // Get all Boxes in specific city_id
    const allBox = await getAllBoxes(city_id);

    // Check if no boxes were found
    if (allBox.length === 0) {
      return res
        .status(404)
        .json(errorResponse(404, "No boxes found for this city_id"));
    }

    // Respond with the retrieved boxes
    res.status(200).json(successResponse(200, "All Boxes", allBox));
  } catch (error: any) {
    logger.error("Error in controller getAllBoxesInCityHandler", error.message);
    return res.status(500).json(errorResponse(500, "Internal server error"));
  }
};

// Get Box By boxName & city_id query
export const getBoxByNameAndCityIdHandler = async (
  req: Request<{}, {}, {}, BoxQueryInput>,
  res: Response
) => {
  const { boxName, city_id } = req.query;
  const city_Id = Number(city_id);
  try {
    // get boxInfo and members
    const box = await getBoxByNameAndCity_id(boxName, city_Id);

    res.status(200).json(successResponse(200, "Box member", box));
  } catch (error: any) {
    logger.error(
      "Error in controller getBoxByNameAndCityIdHandler",
      error.message
    );
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
};

// Create Vote Record
export const createVoteRecordHandler = async (
  req: Request<{}, {}, VoteRecordInput>,
  res: Response
) => {
  try {
    const { state, envoy_id, member_id } = req.body;

    const { envoy, member } = await findEnvoyAndMember(envoy_id, member_id);

    // Check if envoy exists
    if (!envoy) {
      return res.status(404).json(errorResponse(404, "enovy not found"));
    }

    // Check if member_id exists
    if (!member) {
      return res
        .status(404)
        .json(errorResponse(404, "member_id does not found"));
    }

    // Check if member and envoy follow the same box_id
    if (member.box_id.toString() !== envoy.box_id.toString()) {
      return res
        .status(400)
        .json(
          errorResponse(404, "Member and envoy do not share the same box_id")
        );
    }

    // Check old record state
    const oldState = await findRecordMember(member_id);

    // Check if vote record already exists update if not created
    const VoteRecord = await updateVoteRecord(envoy_id, member_id, state);

    const isCreated =
      VoteRecord?.createdAt.getTime() === VoteRecord?.updatedAt.getTime();
    const message = isCreated
      ? "Vote created successfully"
      : "Vote updated successfully";

    // Update cache records
    const finalResult = await updateCacheRecord(envoy, state, oldState);

    // Event web socket
    if (finalResult) {
      emitWebSocketEvent(envoy.candidate_id.toString(), finalResult);
    }

    return res.status(200).json(successResponse(200, message, VoteRecord));
  } catch (error: any) {
    logger.error("Error in controller createVoteRecordHandler", error.message);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
};

// Search Member
export const getMemberSearchHandler = async (
  req: Request<{}, {}, {}, SearchQueryInput>,
  res: Response
) => {
  try {
    const { box_id, query } = req.query;

    // Validate query parameters
    if (!query || !box_id) {
      return res
        .status(400)
        .json(
          errorResponse(400, "Both 'query' and 'box_id' must be provided", [])
        );
    }

    // Check if members exist
    const isExistMembers = await checkExistCacheMember(box_id);
    let resultSearch: any;

    if (isExistMembers) {
      logger.warn("already exist cache member");
      resultSearch = await searchHashMember(box_id, query);
    } else {
      logger.warn("not exist cache members");

      // Retrieve and cache members if not in cache
      const memberList: IMemberSearch[] = await searchQueryMember(box_id);
      // set data in cache
      await setCacheHashMember(
        `boxMembers:${box_id}:member:`,
        memberList,
        3600 * 24 * 2
      ); // set data for 2 days

      // Create index after set cache
      await createIndexMember(box_id);
      await delay(500);
      resultSearch = await searchHashMember(box_id, query);
    }

    if (resultSearch.length < 1) {
      return res.status(404).json(successResponse(404, "no result found", []));
    }

    return res
      .status(200)
      .json(successResponse(200, "result found", resultSearch));
  } catch (error: any) {
    logger.error("Error in controller getMemberSearchHandler", error.message);
    return res.status(500).json(errorResponse(500, "something went wrong"));
  }
};

// Export Member To Excel File
export const exportMembersHandler = async (req: Request, res: Response) => {
  try {
    const { envoyId } = req.params;
    // get all members data with vote state for envoy
    const membersInfo = await getMembersDataVote(envoyId);

    const { url, fileName } = await exportExcel(membersInfo, envoyId, res);

    return res.status(200).json(
      successResponse(200, "create file excel successfully", {
        url,
        fileName,
      })
    );
  } catch (error: any) {
    logger.error("Error in controller exportMembersHandler", error.message);
    return res
      .status(500)
      .json(errorResponse(res.statusCode, "Something went wrong"));
  }
};

// Utility function to create a delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

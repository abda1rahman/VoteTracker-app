import { isValidObjectId } from "mongoose";
import { object, string, number, TypeOf, nativeEnum  } from "zod";
import {IStateRecord} from "../model/box.model"
export const createBoxesSchema = object({
  body: object({
    city_id: number({
      required_error: "city_id required as number",
    })
      .int()
      .min(1)
      .max(12),
    log: number({ required_error: "longitude required as number" }),
    lat: number({ required_error: "latitude required as number" }),
    boxName: string({ required_error: "Box Name required" }),
  }),
});

export const createMemberSchema = object({
  body: object({
    // box_id: string({required_error: "box_id is required"}).refine(id => isValidObjectId(id), {message: "Invalid ObjectId format"}),
    city_id: number({
      required_error: "City_id required as number",
    })
      .int()
      .min(1)
      .max(12),
    boxName: string({ required_error: "boxName is required" }),
    firstName: string({ required_error: "First Name is required" }),
    lastName: string({ required_error: "Last Name is required" }),
    ssn: string({
      required_error: "ssn => Social security number is required.",
    }),
  }),
});

// Vote Record Schema
export const createVoteRecordSchema = object({
  body: object({
    state: nativeEnum(IStateRecord,{
      required_error: "Invalid voting status provided. Must be one of: 0, 1, 2, 3.",
    }),
    envoy_id: string({ required_error: "envoy_id should be string" }).refine(
      (id) => isValidObjectId(id),
      { message: "envoy_id must be valid id" }
    ),
    member_id: string({
      required_error: "member_id should be string",
    }).refine((id) => isValidObjectId(id), {
      message: "member_id must be valid id",
    }),
  }),
});

// Check Params for city_id
export const getBoxesByCitySchema = object({
  params: object({
    city_id: string().refine(
      (id) => {
        const parsedId = parseInt(id);
        return Number.isInteger(parsedId) && parsedId >= 1 && parsedId <= 12;
      },
      {
        message: "city_id must be a vaild integer between 1 to 12",
      }
    ),
  }),
});

// Check box by name & city_id
export const getBoxNameAndCityIdSchema = object({
  query: object({
    city_id: string({
      required_error: "city_id is required",
    }).refine(
      (id) => {
        const parsedId = parseInt(id);
        return Number.isInteger(parsedId) && parsedId >= 1 && parsedId <= 12;
      },
      {
        message: "city_id must be a vaild integer between 1 to 12",
      }
    ),
    boxName: string({
      required_error: "boxName is required",
    }),
  }),
});

export const getSearchMemberSchema = object({
  query: object({
    query: string({
      required_error: "query is required",
    }),
    box_id: string({ required_error: "box_id should be string" }).refine(
      (id) => isValidObjectId(id),
      { message: "box_id must be valid id" }
    ),
  })
})

export type BoxesInput = TypeOf<typeof createBoxesSchema>["body"];
export type MemberInput = TypeOf<typeof createMemberSchema>["body"];
export type VoteRecordInput = TypeOf<typeof createVoteRecordSchema>["body"];

export type BoxParamsInput = TypeOf<typeof getBoxesByCitySchema>["params"];
export type BoxQueryInput = TypeOf<typeof getBoxNameAndCityIdSchema>["query"];
export type SearchQueryInput = TypeOf<typeof getSearchMemberSchema>["query"];


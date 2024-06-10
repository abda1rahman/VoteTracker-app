import { isValidObjectId } from "mongoose";
import { object, string, number, TypeOf } from "zod";

export const createBoxesSchema = object({
  body: object({
    city_id: number({
      required_error: "City_id required as number"
    }).int().min(1).max(12),
    log: number({required_error: "longitude required as number"}), 
    lat: number({required_error: "latitude required as number"}),
    boxName: string({required_error:"Box Name required"})
  })
})

export const createBoxDetailsSchema = object({
  body: object({
    box_id: string({required_error: "box_id is required"}).refine(id => isValidObjectId(id), {message: "Invalid ObjectId format"}),
    boxName: string({required_error: "boxName is required"}),
    firstName: string({required_error: "First Name is required"}),
    lastName: string({required_error: "Last Name is required"}),
  })
})

export type BoxesInput = TypeOf<typeof createBoxesSchema>["body"];
export type BoxDetailsInput = TypeOf<typeof createBoxDetailsSchema>["body"]
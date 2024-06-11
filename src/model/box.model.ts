import mongoose, {Document} from "mongoose";
import { BoxesInput, BoxDetailsInput } from "../schema/box.schema";

// Type for box 
export interface BoxesType extends BoxesInput,  Document {
  id: mongoose.Types.ObjectId
}

export interface BoxDetailsType extends BoxDetailsInput, Document {}

const BoxesSchema = new mongoose.Schema({
  city_id: {type: Number, required: true},
  log: {type: Number, required: true},
  lat: {type: Number, required: true},
  boxName: {type: String, required: true}
},{
  toJSON: {
    transform:function(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
})

const boxDetailsSchema = new mongoose.Schema({
  box_id: {type: mongoose.Schema.ObjectId, ref: "boxes", required: true},
  boxName: {type: String, required: true},
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""}
},{
  toJSON: {
    transform: function(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
})


export const BoxesModel = mongoose.model<BoxesType>("boxes", BoxesSchema)
export const BoxDetailsModel = mongoose.model<BoxDetailsType>("box_details",boxDetailsSchema)
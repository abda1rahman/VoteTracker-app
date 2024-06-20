import mongoose, {Document, Schema} from "mongoose";
import { BoxesInput, BoxMemberInput } from "../schema/box.schema";


// Type for box 
export interface BoxesType extends BoxesInput, Document {
  id: mongoose.Types.ObjectId,
}

export interface BoxMemberType extends BoxMemberInput, Document {}

export interface VoteRecordType extends Document {
  state: boolean;
  envoy: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  boxMember: mongoose.Types.ObjectId;
}

const BoxesSchema = new mongoose.Schema({
  city_id: {type: Number, ref:"City", required: true},
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

const boxMemberSchema = new mongoose.Schema({
  box_id: {type: mongoose.Schema.ObjectId, ref: "boxes", required: true},  
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""},
  ssn: {type: String, required: true},
},{
  toJSON: {
    transform: function(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
})

const voteRecordSchema = new mongoose.Schema({
  state: {type: Boolean, default: false},
  envoy: {type: Schema.Types.ObjectId, ref: "Envoy",},
  candidate: {type: Schema.Types.ObjectId, ref: "candidates"},
  boxMember: {type: Schema.Types.ObjectId, ref: 'box_member'}
},{
  toJSON: {
    transform: function(doc, ret){
      ret.id = ret._id;
      delete ret._id,
      delete ret.__v
    }
  }
})


export const BoxesModel = mongoose.model<BoxesType>("boxes", BoxesSchema)
export const BoxMemberModel = mongoose.model<BoxMemberType>("box_member",boxMemberSchema)
export const VoteRecordModel = mongoose.model<VoteRecordType>('vote_record', voteRecordSchema)
import mongoose, {Document, Schema} from "mongoose";
import { BoxesInput, BoxMemberInput } from "../schema/box.schema";


// Type for box 
export interface BoxesType extends BoxesInput, Document {
  id: mongoose.Types.ObjectId,
}

export interface BoxMemberType extends Omit<BoxMemberInput, 'boxName' |'city_id'>, Document {
  box_id: mongoose.Types.ObjectId;
}

export interface VoteRecordType extends Document {
  state: boolean;
  envoy_id: mongoose.Types.ObjectId;
  candidate_id: mongoose.Types.ObjectId;
  member_id: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
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
  envoy_id: {type: Schema.Types.ObjectId, ref: "Envoy",},
  candidate_id: {type: Schema.Types.ObjectId, ref: "candidates"},
  member_id: {type: Schema.Types.ObjectId, ref: 'member'}
},{
  timestamps: true,
  toJSON: {
    transform: function(doc, ret){
      ret.id = ret._id;
      delete ret._id,
      delete ret.__v
    }
  }
})


export const BoxesModel = mongoose.model<BoxesType>("boxes", BoxesSchema)
export const BoxMemberModel = mongoose.model<BoxMemberType>("member",boxMemberSchema)
export const VoteRecordModel = mongoose.model<VoteRecordType>('vote_record', voteRecordSchema)
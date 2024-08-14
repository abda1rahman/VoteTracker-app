import mongoose, { Document, Schema, Types } from "mongoose";

import { BoxesInput, MemberInput } from "../schema/box.schema";
// Type box
export interface BoxesType extends BoxesInput, Document {
  id: mongoose.Types.ObjectId;
}
// Type member
export type IMemberType = {
  _id: Types.ObjectId
  box_id: mongoose.Types.ObjectId;
  firstName: string;
  secondName: string;
  thirdName:string;
  lastName: string;
  ssn: string;
  identity: number;
} & Document

// Type enum vote-record
export enum IStateRecord {NOT_VOTE=0, VOTE=1, SECRET=2, OTHERS=3}
// Type vote-record
export interface VoteRecordType extends Document {
  state: IStateRecord;
  envoy_id: mongoose.Types.ObjectId;
  candidate_id: mongoose.Types.ObjectId;
  member_id: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

export type IFinalVoteResult = {
  candidate_id: mongoose.Types.ObjectId
  totalVote: number;
} & Document

const BoxesSchema = new mongoose.Schema(
  {
    city_id: { type: Number, ref: "City", required: true },
    log: { type: Number, required: true },
    lat: { type: Number, required: true },
    boxName: { type: String, required: true },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const MemberSchema = new mongoose.Schema(
  {
    box_id: { type: mongoose.Schema.ObjectId, ref: "boxes", required: true },
    firstName: { type: String, default: "" },
    secondName: { type: String, default: "" },
    thirdName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    ssn: { type: String, required: true },
    identity: { type: Number },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

MemberSchema.index({ firstName: "text" });
MemberSchema.index({ box_id: 1 });

const voteRecordSchema = new mongoose.Schema(
  {
    state: { type: Number, enum: [0,1,2,3], default: 0 },
    envoy_id: { type: Schema.Types.ObjectId, ref: "Envoy" },
    candidate_id: { type: Schema.Types.ObjectId, ref: "candidates" },
    member_id: { type: Schema.Types.ObjectId, ref: "member" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id, delete ret.__v;
      },
    },
  }
);


voteRecordSchema.index({envoy_id: 1})
voteRecordSchema.index({member_id: 1})

const FinalResultSchema = new Schema({
  candidate_id: {type: Schema.Types.ObjectId, ref: "candidates"},
  totalVote: {type: Number, default: 0},
})

export const FinalResultModel = mongoose.model<IFinalVoteResult>('final_result', FinalResultSchema)
export const BoxesModel = mongoose.model<BoxesType>("boxes", BoxesSchema);
export const MemberModel = mongoose.model<IMemberType>(
  "member",
  MemberSchema
);
export const VoteRecordModel = mongoose.model<VoteRecordType>(
  "vote_record",
  voteRecordSchema
);

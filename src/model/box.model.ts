import mongoose, { Document, Schema } from "mongoose";

import { BoxesInput, MemberInput } from "../schema/box.schema";
// Type box
export interface BoxesType extends BoxesInput, Document {
  id: mongoose.Types.ObjectId;
}
// Type member
export interface MemberType
  extends Omit<MemberInput, "boxName" | "city_id">,
    Document {
  box_id: mongoose.Types.ObjectId;
}
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
MemberSchema.index({ identity: 1 });

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

export const BoxesModel = mongoose.model<BoxesType>("boxes", BoxesSchema);
export const MemberModel = mongoose.model<MemberType>(
  "member",
  MemberSchema
);
export const VoteRecordModel = mongoose.model<VoteRecordType>(
  "vote_record",
  voteRecordSchema
);

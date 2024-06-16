import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  city_id: {
    type: Number,
    ref: "City",
    required: true,
    unique: true,
  },
  city: {
    type: String,
  },
},{
  toJSON: {
    transform: function(doc, ret){
      delete ret._id
    }
  }
});

const City = mongoose.model("City", citySchema);

export default City;

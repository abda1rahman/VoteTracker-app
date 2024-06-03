import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  city_id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
});

const City = mongoose.model("city", citySchema, "city");

export default City;

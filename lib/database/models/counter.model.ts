import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
export default Counter;
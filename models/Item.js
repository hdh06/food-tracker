import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  dateBrought: Date,
  expiryDate: Date,
  recipe: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Item", itemSchema);

import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Item", itemSchema);

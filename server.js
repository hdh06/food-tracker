import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import kitchenRouter from "./routes/items.js";       // Your Kitchen
import analyticsRouter from "./routes/analytics.js"; // Analytics
import recipesRouter from "./routes/recipes.js";     // Recipes
import foodBankRouter from "./routes/foodbank.js";   // Food Bank

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend

// connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/foodtracker")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// routes
app.use("/api/items", kitchenRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/foodbank", foodBankRouter);

app.listen(4000, () => console.log("Server running at http://localhost:4000"));

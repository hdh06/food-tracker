import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// Get all recipes or search by recipe field
router.get("/", async (req, res) => {
    const searchQuery = req.query.search || "";
    const recipes = await Item.find({
        recipe: { $regex: searchQuery, $options: "i" }
    });
    res.json(recipes);
});

export default router;

import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// Example: return number of items expiring per day
router.get("/", async (req, res) => {
  const items = await Item.find();
  const analytics = {};

  items.forEach(item => {
    const date = item.expiryDate.toISOString().slice(0, 10);
    analytics[date] = (analytics[date] || 0) + item.quantity;
  });

  // convert to array for chart
  const chartData = Object.keys(analytics).map(date => ({
    date,
    itemsExpiring: analytics[date]
  }));

  res.json(chartData);
});

export default router;

import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const banks = [
    { name: "City Food Bank", address: "123 Main St" },
    { name: "Community Pantry", address: "456 Oak Ave" }
  ];
  res.json(banks);
});

export default router;

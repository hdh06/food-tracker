import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  // Replace this with API call or OpenAI later
  const recipes = [
    { id: 1, title: "Tomato Pasta", instructions: "Cook pasta and add tomatoes." },
    { id: 2, title: "Veggie Omelette", instructions: "Beat eggs, add vegetables, cook on pan." }
  ];
  res.json(recipes);
});

export default router;

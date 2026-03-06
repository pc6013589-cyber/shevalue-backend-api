import express from "express";
import { analyzeMessage } from "../services/analyzerService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, relationshipStatus } = req.body;

    const result = await analyzeMessage(message, relationshipStatus);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analyzer failed" });
  }
});

export default router;
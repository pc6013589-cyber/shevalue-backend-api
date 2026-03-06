import express from "express";
import { streamTherapistResponse } from "../services/therapistService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, relationshipStatus } = req.body;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    await streamTherapistResponse(res, message, relationshipStatus);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Therapist failed" });
  }
});

export default router;
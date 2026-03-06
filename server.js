// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

// Check API key
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY is missing.");
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey,
});

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ✅ Declare PORT ONLY ONCE
const PORT = 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
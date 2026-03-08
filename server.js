import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running 🚀",
    openaiConfigured: !!apiKey,
  });
});

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("OpenAI request timed out")), ms)
    ),
  ]);
}

app.post("/analyze", async (req, res) => {
  try {
    if (!openai) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing on server",
      });
    }

    const { message, relationshipStatus } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("🧠 Analyze request received");

    const response = await withTimeout(
      openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: `
You are SheValue Analyzer, an emotionally intelligent relationship message analyst for women.

Return JSON only in this exact format:

{
  "feminine_score": number,
  "signal": "short explanation",
  "risk_level": "low | medium | high",
  "suggested_reply": "a classy feminine response"
}

Consider relationship type: ${relationshipStatus || "Unknown"}

Evaluate the message based on:
- Respect
- Emotional maturity
- Clarity of intention
- Effort and seriousness
- Consistency
- Boundary awareness
- Feminine value alignment

Scoring Guide:
0-20 = highly disrespectful, manipulative, unsafe, sexual pressure, or extremely low effort
21-40 = low effort, unclear intentions, emotionally immature behaviour
41-60 = mixed signals, inconsistent effort, unclear direction
61-80 = decent but not fully intentional or emotionally clear
81-100 = respectful, clear, emotionally mature and intentional communication

Detect patterns such as:
- sexual pressure
- manipulation
- breadcrumbing
- love bombing
- low effort communication
- emotionally unavailable behaviour
- vague invitations
- disrespect for boundaries
- situationship energy
- controlling language

The "signal" should be short and easy to understand.
The "risk_level" must be low, medium, or high.
The "suggested_reply" must be calm, feminine, confident, emotionally intelligent, boundary-respecting, never aggressive, never desperate, and never rude.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
      25000
    );

    const content = response.output_text;

    if (!content) {
      console.error("❌ Analyzer returned empty content");
      return res.status(500).json({ error: "Analyzer returned empty content" });
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error("❌ Failed to parse analyzer JSON:", content);
      return res.status(500).json({ error: "Analyzer returned invalid JSON" });
    }

    console.log("✅ Analyze success");
    res.json(result);
  } catch (error) {
    console.error("❌ Analyzer Error:", error);
    res.status(500).json({
      error: error.message || "Analyzer failed",
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    if (!openai) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing on server",
      });
    }

    const { message, relationship } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("💬 Chat request received");

    const response = await withTimeout(
      openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: `You are SheValue Therapist, a calm, emotionally intelligent, supportive feminine relationship therapist. Relationship status: ${relationship || "Unknown"}.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
      25000
    );

    const reply = response.output_text;

    if (!reply) {
      console.error("❌ Chat returned empty reply");
      return res.status(500).json({ error: "Chat returned empty reply" });
    }

    console.log("✅ Chat success");
    res.json({ reply });
  } catch (error) {
    console.error("❌ Chat Error:", error);
    res.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
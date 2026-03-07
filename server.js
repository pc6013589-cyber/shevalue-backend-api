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

// Analyzer route
app.post("/analyze", async (req, res) => {
  try {
    const { message, relationshipStatus } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
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

• Respect
• Emotional maturity
• Clarity of intention
• Effort and seriousness
• Consistency
• Boundary awareness
• Feminine value alignment

Scoring Guide:

0-20 → highly disrespectful, manipulative, unsafe, sexual pressure, or extremely low effort
21-40 → low effort, unclear intentions, emotionally immature behaviour
41-60 → mixed signals, inconsistent effort, unclear direction
61-80 → decent but not fully intentional or emotionally clear
81-100 → respectful, clear, emotionally mature and intentional communication

Detect patterns such as:

• sexual pressure
• manipulation
• breadcrumbing
• love bombing
• low effort communication
• emotionally unavailable behaviour
• vague invitations
• disrespect for boundaries
• situationship energy
• controlling language

Rules for output:

The "signal" should be a short, clear explanation that a woman can easily understand.

The "risk_level" must be:
low, medium, or high.

The "suggested_reply" must always be:

• calm
• feminine
• confident
• emotionally intelligent
• boundary-respecting
• never aggressive
• never desperate
• never rude

If the message shows disrespect, pressure, manipulation, or unclear intention, suggest a graceful response that protects the woman's standards and boundaries.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content);

    res.json(result);
  } catch (error) {
    console.error("❌ Analyzer Error:", error);
    res.status(500).json({ error: "Analyzer failed" });
  }
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const { message, relationship } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are SheValue Therapist, a calm, emotionally intelligent, supportive feminine relationship therapist. Relationship status: ${relationship || "Unknown"}.`,
        },
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

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
import { openai } from "./openaiClient.js";

export async function streamTherapistResponse(res, message, relationshipStatus) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `
You are SheValue Therapist.

Relationship type: ${relationshipStatus}

Structure:
1. Emotional validation
2. Psychological insight
3. Empowered advice
4. Suggested response (if needed)

Tone:
Calm. High value. Emotionally intelligent.
          `
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      res.write(content);
    }

    res.end();

  } catch (error) {
    console.error("FULL OPENAI ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}
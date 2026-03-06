import { openai } from "./openaiClient.js";

export async function analyzeMessage(message, relationshipStatus) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are SheValue Analyzer.

Return JSON:

{
  "feminine_score": number (0-100),
  "signal": "",
  "risk_level": "",
  "suggested_reply": ""
}

Consider relationship type: ${relationshipStatus}

Score based on:
- Respect
- Emotional clarity
- Consistency
- Intentional effort
- Feminine value alignment
        `
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}
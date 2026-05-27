import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

async function generateWithRetry(prompt, maxRetries = 1) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelName = MODELS[attempt % MODELS.length];

    try {
      console.log(
        `Roadmap attempt ${attempt + 1}/${maxRetries} using ${modelName}`
      );

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      });

      console.log(`Roadmap success with ${modelName}`);

      return response;
    } catch (err) {
      const isRetryable =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes("503") ||
        err?.message?.includes("429") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      const isLast = attempt === maxRetries - 1;

      console.error(
        `Roadmap attempt ${attempt + 1} failed (${modelName}):`,
        err.message
      );

      if (isRetryable && !isLast) {
        const waitMs = 4000 * (attempt + 1);

        await new Promise((r) => setTimeout(r, waitMs));

        continue;
      }

      throw err;
    }
  }
}

export async function generateRoadmap(req, res) {
  try {
    const { skillGaps } = req.body;

    if (!skillGaps || !Array.isArray(skillGaps) || skillGaps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "skillGaps must be a non-empty array.",
      });
    }

    const limitedSkills = skillGaps.slice(0, 3);

    const skillList = limitedSkills.join(", ");

    const prompt = `
Return ONLY valid JSON.

Create a practical and detailed 4-week learning roadmap for a beginner who wants to improve these skills:

${skillList}

Requirements:
- Return valid JSON only
- Do not use markdown
- Do not use backticks
- Do not add explanations outside JSON
- Write everything in English
- Keep the roadmap clear and beginner-friendly
- Make activities practical and actionable
- Each week must have:
  - 1 learning theme
  - 2 tasks
- Each activity should be 1-2 short sentences only
- Avoid special characters and unnecessary symbols
- Use plain text only

JSON format:
{
  "summary": "Short motivational summary",
  "weeks": [
    {
      "week": 1,
      "theme": "Week theme",
      "tasks": [
        {
          "day": "Monday - Wednesday",
          "activity": "Learning activity"
        },
        {
          "day": "Thursday - Sunday",
          "activity": "Practice or mini project"
        }
      ]
    }
  ]
}
`.trim();

    const response = await generateWithRetry(prompt);

    // FIX PENTING
    const rawText = response.text || "";

    console.log("RAW TEXT:");
    console.log(rawText);

    const cleanText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let roadmap;

    try {
      roadmap = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:");
      console.error(cleanText);

      return res.status(500).json({
        success: false,
        message: "AI returned malformed JSON.",
        raw: cleanText,
      });
    }

    return res.status(200).json({
      success: true,
      skillGaps: limitedSkills,
      roadmap,
    });
  } catch (error) {
    console.error("===== ROADMAP ERROR =====");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
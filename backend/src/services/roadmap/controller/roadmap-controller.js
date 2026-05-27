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
          temperature: 0.5,
          maxOutputTokens: 4096,
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
You are an experienced career mentor and professional learning advisor.

Create a comprehensive and practical 4-week learning roadmap for a university student who wants to learn these skills from beginner level:

${skillList}

IMPORTANT RULES:
- Respond ONLY with valid JSON
- Do NOT use markdown
- Do NOT use backticks
- Do NOT add explanations outside JSON
- Use ONLY double quotes
- No trailing commas
- Write everything in English
- Make the roadmap beginner-friendly
- Make tasks practical and actionable
- Include realistic daily learning activities
- Include mini projects or practice sessions
- Include useful beginner-friendly resources
- Each week must contain:
  - 1 theme
  - at least 3 goals
  - at least 4 tasks

JSON FORMAT:
{
  "summary": "Short motivational summary",
  "weeks": [
    {
      "week": 1,
      "theme": "Week theme",
      "goals": [
        "Goal 1",
        "Goal 2",
        "Goal 3"
      ],
      "tasks": [
        {
          "day": "Monday",
          "activity": "Learning activity",
          "skill": "Skill being learned",
          "resources": "Learning resources"
        },
        {
          "day": "Tuesday",
          "activity": "Learning activity",
          "skill": "Skill being learned",
          "resources": "Learning resources"
        },
        {
          "day": "Wednesday - Thursday",
          "activity": "Learning activity",
          "skill": "Skill being learned",
          "resources": "Learning resources"
        },
        {
          "day": "Friday - Sunday",
          "activity": "Mini project or practice",
          "skill": "Skill being learned",
          "resources": "Learning resources"
        }
      ]
    }
  ],
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
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
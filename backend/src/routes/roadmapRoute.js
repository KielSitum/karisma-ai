import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Retry helper with exponential backoff
 */
async function generateWithRetry(prompt, maxRetries = 3) {
  const models = [
    "gemini-1.5-flash",
    "gemini-2.5-flash",
  ];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelName = models[attempt % models.length];

    try {
      console.log(
        `Attempt ${attempt + 1}/${maxRetries} using ${modelName}`
      );

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      // timeout protection
      const timeoutMs = 30000;

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout")),
            timeoutMs
          )
        ),
      ]);

      console.log(`Success with ${modelName}`);

      return result;
    } catch (error) {
      const is503 =
        error?.status === 503 ||
        error?.message?.includes("503") ||
        error?.message?.includes("UNAVAILABLE");

      const isLastAttempt = attempt === maxRetries - 1;

      console.error(
        `Attempt ${attempt + 1} failed (${modelName}):`,
        error.message
      );

      if (is503 && !isLastAttempt) {
        const waitMs = 3000 * (attempt + 1);

        console.log(
          `Gemini overloaded. Waiting ${waitMs / 1000}s...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, waitMs)
        );

        continue;
      }

      throw error;
    }
  }
}

/**
 * POST /api/roadmap/generate
 * Body: { skillGaps: string[] }
 */
export async function generateRoadmap(req, res) {
  try {
    const { skillGaps } = req.body;

    // validation
    if (
      !skillGaps ||
      !Array.isArray(skillGaps) ||
      skillGaps.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "skillGaps must be a non-empty array.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    // limit skills to reduce token usage
    const limitedSkills = skillGaps.slice(0, 4);

    const skillList = limitedSkills.join(", ");

    const prompt = `
You are an experienced career mentor.

Create a concise and realistic 4-week learning roadmap for a university student who wants to learn these skills from beginner level:

${skillList}

IMPORTANT:
- Respond ONLY with valid JSON
- No markdown
- No backticks
- No explanations outside JSON

JSON format:
{
  "summary": "Short motivational summary",
  "weeks": [
    {
      "week": 1,
      "theme": "Week theme",
      "goals": ["Goal 1", "Goal 2"],
      "tasks": [
        {
          "day": "Monday - Tuesday",
          "activity": "Learning activity",
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

RULES:
- Maximum 2 goals per week
- Maximum 3 tasks per week
- Keep responses concise
- Make it practical for university students
`.trim();

    const result = await generateWithRetry(prompt);

    const rawText = result.response.text();

    if (!rawText) {
      return res.status(500).json({
        success: false,
        message: "AI did not return a response.",
      });
    }

    console.log("RAW RESPONSE:");
    console.log(rawText);

    // clean markdown if Gemini adds it
    const cleanText = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let roadmap;

    try {
      roadmap = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);

      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response.",
      });
    }

    return res.status(200).json({
      success: true,
      skillGaps: limitedSkills,
      roadmap,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    const is503 =
      error?.status === 503 ||
      error?.message?.includes("503") ||
      error?.message?.includes("UNAVAILABLE");

    if (is503) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is currently busy. Please try again in a few moments.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An unexpected server error occurred.",
    });
  }
}
import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

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
 * Controller
 */
async function generateRoadmap(req, res) {
  try {
    const { skillGaps } = req.body;

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
`.trim();

    const result = await generateWithRetry(prompt);

    const rawText = result.response.text();

    const cleanText = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const roadmap = JSON.parse(cleanText);

    return res.status(200).json({
      success: true,
      skillGaps: limitedSkills,
      roadmap,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}

router.post("/generate", generateRoadmap);

export default router;
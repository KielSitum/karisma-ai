import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/roadmap/generate
 * Body: { skillGaps: string[] }
 * Generate personalized 4-week learning roadmap using Gemini API.
 */
export async function generateRoadmap(req, res) {
  try {
    const { skillGaps } = req.body;

    // Validate input
    if (!skillGaps || !Array.isArray(skillGaps) || skillGaps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "skillGaps must be a non-empty array.",
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured on the server.",
      });
    }

    // Limit skills to avoid huge prompts
    const limitedSkills = skillGaps.slice(0, 4);
    const skillList = limitedSkills.join(", ");

    const prompt = `
You are an experienced technology career mentor.

Create an intensive 4-week learning roadmap for a university student who wants to learn these skills from beginner level:

${skillList}

IMPORTANT RULES:
- Respond ONLY with valid JSON
- Do NOT use markdown
- Do NOT use backticks
- Do NOT add explanations outside JSON

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

Create a realistic and actionable roadmap for Indonesian university students.
`.trim();

    let result;

    try {
      // Primary model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      result = await model.generateContent(prompt);
    } catch (error) {
      console.log(
        "gemini-2.5-flash failed, switching to gemini-1.5-flash..."
      );

      // Fallback model
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      result = await fallbackModel.generateContent(prompt);
    }

    const rawText = result.response.text();

    if (!rawText) {
      return res.status(500).json({
        success: false,
        message: "AI did not return any response.",
      });
    }

    // Clean markdown if Gemini accidentally returns it
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
        message: "Failed to parse AI response JSON.",
      });
    }

    return res.status(200).json({
      success: true,
      skillGaps: limitedSkills,
      roadmap,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "AI server is currently busy. Please try again in a few moments.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "An unexpected server error occurred.",
    });
  }
}
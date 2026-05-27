import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/generate", async (req, res) => {
  try {
    console.log("===== ROADMAP REQUEST =====");
    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);
    console.log("REQ BODY:", req.body);

    const { skillGaps } = req.body;

    // Validasi input
    if (!skillGaps || !Array.isArray(skillGaps) || skillGaps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "skillGaps harus berupa array yang tidak kosong.",
      });
    }

    const skillList = skillGaps.join(", ");

    const prompt = `
    You are an experienced career mentor.

    Create an intensive 4-week learning roadmap for university students who want to master the following skills from beginner level:

    ${skillList}

    IMPORTANT RULES:
    - Respond ONLY with valid JSON
    - Do not use markdown
    - Do not use \`\`\`
    - Do not add any explanation outside the JSON
    - All output must be written in English
    - Exclude Saturday and Sunday from the schedule
    - Only create learning tasks for Monday to Friday
    - Do not include weekend activities

    JSON Format:
    {
      "summary": "Short motivational summary",
      "weeks": [
        {
          "week": 1,
          "theme": "Weekly theme",
          "goals": ["Goal 1", "Goal 2"],
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


    console.log("Generating roadmap...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("FULL RESPONSE:", response);

    // Ambil text response
    const rawText = response.text;

    console.log("RAW TEXT:");
    console.log(rawText);

    if (!rawText) {
      return res.status(500).json({
        success: false,
        message: "AI tidak mengembalikan respons.",
      });
    }

    // Bersihkan markdown jika ada
    const cleanText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEAN TEXT:");
    console.log(cleanText);

    let roadmap;

    // Parse JSON dengan aman
    try {
      roadmap = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:");
      console.error(parseError);

      return res.status(500).json({
        success: false,
        message: "Format JSON dari AI tidak valid.",
        raw: cleanText,
      });
    }

    return res.status(200).json({
      success: true,
      skillGaps,
      roadmap,
    });

  } catch (error) {
    console.error("===== GEMINI ERROR =====");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server.",
    });
  }
});

export default router;
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
Kamu adalah mentor karir yang berpengalaman.

Buatkan roadmap belajar intensif 4 minggu untuk mahasiswa Indonesia yang ingin menguasai skill berikut dari level pemula:

${skillList}

ATURAN PENTING:
- Balas HANYA dengan JSON valid
- Jangan gunakan markdown
- Jangan gunakan \`\`\`
- Jangan tambahkan penjelasan apapun di luar JSON

Format JSON:
{
  "summary": "Ringkasan motivasi singkat",
  "weeks": [
    {
      "week": 1,
      "theme": "Tema minggu",
      "goals": ["Goal 1", "Goal 2"],
      "tasks": [
        {
          "day": "Senin - Selasa",
          "activity": "Aktivitas belajar",
          "skill": "Skill yang dipelajari",
          "resources": "Sumber belajar"
        }
      ]
    }
  ],
  "tips": [
    "Tips 1",
    "Tips 2",
    "Tips 3"
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
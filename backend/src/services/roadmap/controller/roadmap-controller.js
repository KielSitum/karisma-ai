import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/roadmap/generate
 * Body: { skillGaps: string[] }
 * Menggunakan Gemini API untuk membuat personalized learning roadmap 4 minggu.
 */
export async function generateRoadmap(req, res) {
  try {
    const { skillGaps } = req.body;

    // Validasi input
    if (!skillGaps || !Array.isArray(skillGaps) || skillGaps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "skillGaps harus berupa array yang tidak kosong.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key belum dikonfigurasi di server.",
      });
    }

    const skillList = skillGaps.join(", ");

    const prompt = `
Kamu adalah mentor karir teknologi yang berpengalaman.
Buatkan roadmap belajar intensif 4 minggu untuk mahasiswa yang ingin menguasai skill berikut dari level pemula: ${skillList}.

Instruksi format respons (WAJIB diikuti, balas HANYA dengan JSON murni tanpa markdown):
{
  "summary": "Kalimat singkat motivasi untuk mahasiswa ini (1-2 kalimat)",
  "weeks": [
    {
      "week": 1,
      "theme": "Nama tema minggu ini",
      "goals": ["goal 1", "goal 2"],
      "tasks": [
        {
          "day": "Senin - Selasa",
          "activity": "Deskripsi aktivitas belajar",
          "skill": "Nama skill yang dipelajari",
          "resources": "Rekomendasi resource (misal: YouTube freeCodeCamp, docs resmi, dll)"
        }
      ]
    }
  ],
  "tips": ["Tips sukses 1", "Tips sukses 2", "Tips sukses 3"]
}

Buat untuk 4 minggu. Setiap minggu fokus pada skill yang berbeda atau kombinasi skill. Jadikan realistis dan actionable untuk mahasiswa Indonesia.
    `.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Bersihkan response dari backticks jika ada
    const cleanText = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const roadmap = JSON.parse(cleanText);

    return res.status(200).json({
      success: true,
      skillGaps,
      roadmap,
    });
  } catch (error) {
    console.error("Gemini API Error:", error.message);

    if (error instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "Gagal memproses respons dari AI. Coba lagi.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat membuat roadmap.",
    });
  }
}

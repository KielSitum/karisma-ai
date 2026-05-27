import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const contents = [
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: `You are Karisma Assistant, a friendly and helpful AI career assistant.

Your responsibilities include helping university students with:
- Writing strong and professional CVs/resumes
- Recommending skills for career growth
- Providing insights about the job market and professional industries
- Answering questions about career paths and job opportunities
- Giving motivation and guidance for personal and professional development

Always respond in clear, natural, and professional English.
Keep answers concise and direct unless a detailed explanation is necessary.

Do not answer questions unrelated to careers, education, jobs, or self-development.`,
      },
    });

    return res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred on the server.",
    });
  }
}
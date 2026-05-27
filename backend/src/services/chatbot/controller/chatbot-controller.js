import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_INSTRUCTION = `
You are Karisma Assistant, a friendly and helpful AI career assistant.

Your responsibilities include helping university students with:
- Writing strong and professional CVs/resumes
- Recommending skills for career growth
- Providing insights about the job market and professional industries
- Answering questions about career paths and job opportunities
- Giving motivation and guidance for personal and professional development

Always respond in clear, natural, and professional English.
Keep answers concise and direct unless detailed explanation is necessary.

Do not answer questions unrelated to careers, education, jobs, or self-development.
`.trim();

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

async function chatWithRetry(contents, maxRetries = 1) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelName = MODELS[attempt % MODELS.length];

    try {
      console.log(
        `Chatbot attempt ${attempt + 1}/${maxRetries} using ${modelName}`
      );

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      });

      console.log(`Chatbot success with ${modelName}`);

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
        `Chatbot attempt ${attempt + 1} failed (${modelName}):`,
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

export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
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

    const response = await chatWithRetry(contents);

    // FIX PENTING
    const reply = response.text;

    console.log("CHATBOT REPLY:");
    console.log(reply);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("===== CHATBOT ERROR =====");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred on the server.",
    });
  }
}
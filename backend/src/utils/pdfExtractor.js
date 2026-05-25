import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Extract raw text from a PDF buffer.
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted plain text
 */
export async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    // Clean up the extracted text
    const text = data.text
      .replace(/\r?\n/g, " ") // ubah newline jadi spasi
      .replace(/[ \t]{2,}/g, " ") // hapus spasi berlebih
      .trim();

    return {
      text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (err) {
    throw new Error(`Failed to extract PDF text: ${err.message}`);
  }
}

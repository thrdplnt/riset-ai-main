import { PDFParse } from "pdf-parse";

export async function extractPdfText(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text.trim();
  } catch (error) {
    console.error("PDF extract error:", error);
    return "[Gagal membaca isi PDF]";
  }
}
import mammoth from "mammoth";

export async function extractDocxText(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error("Docx extract error:", error);
    return "[Gagal membaca isi dokumen Word]";
  }
}
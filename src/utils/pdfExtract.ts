export async function extractPdfText(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    
    const pdfParseModule = await import('pdf-parse') as any;
    const pdfParse = pdfParseModule.default ?? pdfParseModule;
    const result = await pdfParse(buffer);
    
    return result.text.trim();
  } catch (error) {
    console.error("PDF extract error:", error);
    return "[Gagal membaca isi PDF]";
  }
}
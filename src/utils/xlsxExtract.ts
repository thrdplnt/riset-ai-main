import * as XLSX from "xlsx";

export async function extractXlsxText(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheetTexts: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }

    return sheetTexts.join("\n\n").trim();
  } catch (error) {
    console.error("Xlsx extract error:", error);
    return "[Gagal membaca isi spreadsheet]";
  }
}
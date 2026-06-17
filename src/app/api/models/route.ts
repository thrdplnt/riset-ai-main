import { NextRequest, NextResponse } from "next/server";
import sql from "@/db/postgres";
import { ApiResponse } from "@/utils/types";

export async function GET(req: NextRequest) {
  try {
    const models = await sql`
      SELECT
        m.id,
        m.display_name,
        m.model_name,
        p.provider_name
      FROM models m
      JOIN providers p ON p.id = m.provider_id
      WHERE m.is_active = true
      ORDER BY p.provider_name, m.display_name ASC
    `;

    return NextResponse.json({
      success: true,
      message: "Berhasil ambil daftar model",
      data: models,
    } satisfies ApiResponse<typeof models>);

  } catch (error) {
    console.error("GET models error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { SesiPerangkat } from "@/domain/DeviceSession";
import { ApiResponse } from "@/utils/types";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        message: "Token tidak ditemukan",
      } satisfies ApiResponse, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const session = await SesiPerangkat.findByToken(token);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Sesi tidak ditemukan",
      } satisfies ApiResponse, { status: 401 });
    }

    await session.hapusSesi();
    return NextResponse.json({
      success: true,
      message: "Logout berhasil",
    } satisfies ApiResponse, { status: 200 });

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
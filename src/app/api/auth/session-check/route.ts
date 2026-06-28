import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { SesiPerangkat } from "@/domain/DeviceSession";
import { ApiResponse } from "@/utils/types";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Tidak ada sesi aktif",
      } satisfies ApiResponse, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Sesi tidak valid",
      } satisfies ApiResponse, { status: 401 });
    }

    const session = await SesiPerangkat.findByToken(token);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Sesi sudah berakhir, kamu login di perangkat lain",
      } satisfies ApiResponse, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Sesi masih aktif",
    } satisfies ApiResponse);

  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
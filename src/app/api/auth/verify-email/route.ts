import { NextRequest, NextResponse } from "next/server";
import { verifyVerifyToken } from "@/utils/jwt";
import { Pengguna } from "@/domain/User";
import { ApiResponse } from "@/utils/types";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Token tidak ditemukan",
      } satisfies ApiResponse, { status: 400 });
    }

    const payload = await verifyVerifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa",
      } satisfies ApiResponse, { status: 400 });
    }

    const user = await Pengguna.findById(payload.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Pengguna tidak ditemukan",
      } satisfies ApiResponse, { status: 404 });
    }

    if (user.verified_at) {
      return NextResponse.json({
        success: true,
        message: "Email sudah terverifikasi sebelumnya",
      } satisfies ApiResponse);
    }

    await Pengguna.verifyEmail(user.id);

    return NextResponse.json({
      success: true,
      message: "Email berhasil diverifikasi! Silakan login.",
    } satisfies ApiResponse);

  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
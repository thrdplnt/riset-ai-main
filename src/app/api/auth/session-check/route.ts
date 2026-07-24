import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { deviceSession } from "@/domain/DeviceSession";
import { users } from "@/domain/users";
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

    const session = await deviceSession.findByToken(token);
    if (!session) {
      const user = await users.findById(payload.userId);
      if (user && !user.is_active) {
        return NextResponse.json({
          success: false,
          message: "Akun kamu telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.",
        } satisfies ApiResponse, { status: 401 });
      }

      const adaSesiBaru = await deviceSession.adaSesiBaru(payload.userId);
      if (adaSesiBaru) {
        return NextResponse.json({
          success: false,
          message: "Sesi berakhir: Batas login 2 perangkat telah terlampaui.",
        } satisfies ApiResponse, { status: 401 });
      }

      return NextResponse.json({
        success: false,
        message: "Sesi berakhir. Silakan login kembali.",
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
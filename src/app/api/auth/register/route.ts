import { NextRequest, NextResponse } from "next/server";
import { Pengguna } from "@/domain/User";
import { ApiResponse } from "@/utils/types";

export async function POST(req: NextRequest) {
  try {
    const { name, email, telp, password } = await req.json();
    if (!name || !email || !telp || !password) {
      return NextResponse.json({
        success: false,
        message: "Semua field wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Format email tidak valid",
      } satisfies ApiResponse, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password minimal 8 karakter",
      } satisfies ApiResponse, { status: 400 });
    }

    const existing = await Pengguna.findByEmail(email);
    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Email sudah terdaftar",
      } satisfies ApiResponse, { status: 409 });
    }

    const user = await Pengguna.create({ name, email, telp, password });
    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil, silakan login",
      data: { id: user.id, email: user.email },
    } satisfies ApiResponse<{ id: string; email: string }>,
      { status: 201 });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
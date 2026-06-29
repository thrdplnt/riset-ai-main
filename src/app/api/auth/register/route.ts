import { NextRequest, NextResponse } from "next/server";
import { users } from "@/domain/users";
import { signVerifyToken } from "@/utils/jwt";
import { sendVerificationEmail } from "@/lib/mailer";
import { isValidEmailDomain } from "@/utils/emailValidator";
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

    const nameRegex = /^[A-Za-z\s]{2,100}$/;
    if (!nameRegex.test(name.trim())) {
      return NextResponse.json({
        success: false,
        message: "Nama harus huruf dan minimal 2 karakter",
      } satisfies ApiResponse, { status: 400 });
    }

    const telpRegex = /^(0|\+62)[0-9]{9,12}$/;
    if (!telpRegex.test(telp.trim())) {
      return NextResponse.json({
        success: false,
        message: "Nomor HP tidak valid, harus 10-13 digit",
      } satisfies ApiResponse, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({
        success: false,
        message: "Format email tidak valid",
      } satisfies ApiResponse, { status: 400 });
    }

    // ── Validasi domain email (MX record + cek disposable/temp-mail) ──
    const isValidDomain = await isValidEmailDomain(email.trim());
    if (!isValidDomain) {
      return NextResponse.json({
        success: false,
        message: "Email tidak valid",
      } satisfies ApiResponse, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password minimal 8 karakter",
      } satisfies ApiResponse, { status: 400 });
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json({
        success: false,
        message: "Password harus kombinasi huruf dan angka",
      } satisfies ApiResponse, { status: 400 });
    }

    const existing = await users.findByEmail(email.trim());
    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Email sudah terdaftar",
      } satisfies ApiResponse, { status: 409 });
    }

    const user = await users.create({
      name: name.trim(),
      email: email.trim(),
      telp: telp.trim(),
      password,
    });

    const verifyToken = await signVerifyToken(user.id);
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (emailError) {
      console.error("Gagal kirim email verifikasi:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Silakan cek email kamu untuk verifikasi sebelum login.",
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
import { Pengguna } from "@/domain/User";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!password || password.length < 8) {
    return NextResponse.json({ success: false, message: "Password minimal 8 karakter." }, { status: 400 });
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return NextResponse.json({ success: false, message: "Password harus kombinasi huruf dan angka." }, { status: 400 });
  }

  const user = await Pengguna.findByResetToken(token);

  if (!user) {
    return NextResponse.json({ success: false, message: "Link tidak valid atau kadaluarsa." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Pengguna.resetPassword(user.id, hashedPassword);

  return NextResponse.json({ success: true, message: "Password berhasil direset." });
}
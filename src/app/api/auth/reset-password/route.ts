// app/api/auth/reset-password/route.ts
import { Pengguna } from "@/domain/User";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  
  const { token, password } = await req.json();

  const user = await Pengguna.findByResetToken(token); // tambah method ini di model

  if (!user) {
    return NextResponse.json({ success: false, message: "Link tidak valid atau kadaluarsa." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Pengguna.resetPassword(user.id, hashedPassword); // tambah method ini di model

  return NextResponse.json({ success: true, message: "Password berhasil direset." });
}

// app/api/auth/forgot-password/route.ts
import { Pengguna } from "@/domain/User";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  
  const user = await Pengguna.findByEmail(email);
  
  // Selalu response sama, biar email tidak bisa di-enumerate
  if (!user) {
    return NextResponse.json({ success: true, message: "Jika email terdaftar, link akan dikirim." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await Pengguna.simpanResetToken(user.id, token, expiresAt); // tambah method ini di model

  await sendPasswordResetEmail(email, token);

  return NextResponse.json({ success: true, message: "Jika email terdaftar, link akan dikirim." });
}
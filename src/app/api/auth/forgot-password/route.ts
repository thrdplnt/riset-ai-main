import { Pengguna } from "@/domain/User";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  
  const user = await Pengguna.findByEmail(email);
  
  if (!user) {
    return NextResponse.json({ success: true, message: "Jika email terdaftar, link akan dikirim." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await Pengguna.simpanResetToken(user.id, token, expiresAt);

  console.log("Sending email to:", email);
  try {
    await sendPasswordResetEmail(email, token);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email error:", err);
  }

  return NextResponse.json({ success: true, message: "Jika email terdaftar, link akan dikirim." });
}
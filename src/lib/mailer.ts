// lib/mailer.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: "onboarding@resend.dev", // domain resend bawaan, bisa ganti domain sendiri
    to,
    subject: "Reset Password",
    html: `
      <p>Klik link berikut untuk reset password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Link berlaku <strong>1 jam</strong>.</p>
    `,
  });
}
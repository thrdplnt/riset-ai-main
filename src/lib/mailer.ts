import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first"); // tambah ini di paling atas

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server ready:", success);
  }
});

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Riset AI" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset Password",
    html: `
      <p>Klik link berikut untuk reset password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Link berlaku <strong>1 jam</strong>.</p>
    `,
  });
}

export async function sendSubscriptionActivatedEmail(to: string, planName: string, tokenLimit: number) {
  await transporter.sendMail({
    from: `"Riset AI" <${process.env.SMTP_USER}>`,
    to,
    subject: "Langganan Kamu Sudah Aktif!",
    html: `
      <p>Selamat! Langganan paket <strong>${planName}</strong> kamu sudah aktif.</p>
      <p>Kuota token: <strong>${tokenLimit.toLocaleString()}</strong> token.</p>
      <p>Silakan login dan mulai chat dengan AI.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat">Mulai Chat</a>
    `,
  });
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Riset AI" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verifikasi Email Kamu - Riset AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Halo, ${name}!</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Terima kasih telah mendaftar di Riset AI. Klik tombol di bawah untuk memverifikasi email kamu:
        </p>
        <a href="${verifyUrl}"
          style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none;
          padding: 12px 24px; border-radius: 8px; font-size: 14px; margin: 16px 0;">
          Verifikasi Email
        </a>
        <p style="color: #888; font-size: 12px;">
          Link ini berlaku selama 24 jam. Jika kamu tidak mendaftar di Riset AI, abaikan email ini.
        </p>
      </div>
    `,
  });
}
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
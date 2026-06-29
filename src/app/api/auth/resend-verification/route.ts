import { NextRequest, NextResponse } from "next/server";
import { users } from "@/domain/users";
import { signVerifyToken } from "@/utils/jwt";
import { sendVerificationEmail } from "@/lib/mailer";
import { ApiResponse } from "@/utils/types";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    const user = await users.findByEmail(email.trim());

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Link verifikasi baru telah dikirim",
      } satisfies ApiResponse);
    }

    if (user.verified_at) {
      return NextResponse.json({
        success: false,
        message: "Email ini sudah terverifikasi. Silakan login.",
      } satisfies ApiResponse, { status: 400 });
    }

    const verifyToken = await signVerifyToken(user.id);
    await sendVerificationEmail(user.email, user.name, verifyToken);

    return NextResponse.json({
      success: true,
      message: "Link verifikasi baru telah dikirim",
    } satisfies ApiResponse);

  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
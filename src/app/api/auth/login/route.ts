import { NextRequest, NextResponse } from "next/server";
import { users } from "@/domain/users";
import { deviceSession } from "@/domain/DeviceSession";
import { signJwt } from "@/utils/jwt";
import { ApiResponse } from "@/utils/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email dan password wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    const user = await users.findByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Email atau password salah",
      } satisfies ApiResponse, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        message: "Akun tidak aktif",
      } satisfies ApiResponse, { status: 403 });
    }

    if (!user.verified_at) {
      return NextResponse.json({
        success: false,
        message: "Email belum diverifikasi.",
      } satisfies ApiResponse, { status: 403 });
    }

    const valid = await user.autentikasi(password);
    if (!valid) {
      return NextResponse.json({
        success: false,
        message: "Email atau password salah",
      } satisfies ApiResponse, { status: 401 });
    }

    const sessionCount = await deviceSession.hitungSesiAktif(user.id);
    if (deviceSession.isMaksimum(sessionCount)) {
      await deviceSession.hapusSessionTerlama(user.id);
    }

    const sessionId = crypto.randomUUID();

    const token = await signJwt({
      userId: user.id,
      role: user.role,
      sessionId,
    });

    const device = req.headers.get("user-agent") || "Unknown device";
    await deviceSession.buatSesiBaru({
      userId: user.id,
      token,
      device,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    } satisfies ApiResponse<{
      token: string;
      role: string;
      user: { id: string; name: string; email: string };
    }>, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}

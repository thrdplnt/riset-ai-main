import { NextRequest, NextResponse } from "next/server";
import { Pengguna } from "@/domain/User";
import { SesiPerangkat } from "@/domain/DeviceSession";
import { signJwt } from "@/utils/jwt";
import { ApiResponse } from "@/utils/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 1. Validasi input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email dan password wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    // 2. Cari user
    const user = await Pengguna.findByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Email atau password salah",
      } satisfies ApiResponse, { status: 401 });
    }

    // 3. Cek user aktif
    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        message: "Akun tidak aktif",
      } satisfies ApiResponse, { status: 403 });
    }

    // 4. Verifikasi password
    const valid = await user.autentikasi(password);
    if (!valid) {
      return NextResponse.json({
        success: false,
        message: "Email atau password salah",
      } satisfies ApiResponse, { status: 401 });
    }

    // 5. Cek device limit
    const sessionCount = await SesiPerangkat.hitungSesiAktif(user.id);
    if (SesiPerangkat.isMaksimum(sessionCount)) {
      return NextResponse.json({
        success: false,
        message: "Batas sesi perangkat tercapai. Logout dari perangkat lain terlebih dahulu.",
      } satisfies ApiResponse, { status: 403 });
    }

    // 6. Buat session ID dulu untuk JWT payload
    const sessionId = crypto.randomUUID();

    // 7. Sign JWT
    const token = await signJwt({
      userId: user.id,
      role: user.role,
      sessionId,
    });

    // 8. Simpan session ke DB
    const device = req.headers.get("user-agent") || "Unknown device";
    await SesiPerangkat.buatSesiBaru({
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
      },
    } satisfies ApiResponse<{ token: string; role: string }>, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}

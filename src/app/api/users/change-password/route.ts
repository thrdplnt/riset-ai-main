import { NextRequest, NextResponse } from "next/server";
import { Pengguna } from "@/domain/User";
import { verifyJwt } from "@/utils/jwt";

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, message: "Semua field wajib diisi" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ success: false, message: "Password baru minimal 8 karakter" }, { status: 400 });
  }

  const user = await Pengguna.findById(payload.userId);
  if (!user) return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });

  const valid = await user.autentikasi(currentPassword);
  if (!valid) {
    return NextResponse.json({ success: false, message: "Password saat ini salah" }, { status: 400 });
  }

  await user.updatePassword(newPassword);

  return NextResponse.json({ success: true, message: "Password berhasil diubah" });
}
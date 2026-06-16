import { NextRequest, NextResponse } from "next/server";
import { Pengguna } from "@/domain/User";
import { verifyJwt } from "@/utils/jwt";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const user = await Pengguna.findById(payload.userId);
  if (!user) return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      name: user.name,
      email: user.email,
      telp: user.telp,
    },
  });
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { name, telp } = await req.json();

  if (!name) return NextResponse.json({ success: false, message: "Nama wajib diisi" }, { status: 400 });

  await Pengguna.updateProfile(payload.userId, { name, telp });

  return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
}
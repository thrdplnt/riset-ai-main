import { NextRequest, NextResponse } from "next/server";
import { SesiPerangkat } from "@/domain/DeviceSession";
import { verifyJwt } from "@/utils/jwt";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params; 

  if (id === payload.sessionId) {
    return NextResponse.json({ success: false, message: "Tidak bisa menghapus sesi aktif" }, { status: 400 });
  }

  await SesiPerangkat.hapusSesiById(id);

  return NextResponse.json({ success: true, message: "Sesi berhasil dihapus" });
}
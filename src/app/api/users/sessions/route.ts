import { NextRequest, NextResponse } from "next/server";
import { deviceSession } from "@/domain/DeviceSession";
import { verifyJwt } from "@/utils/jwt";
import sql from "@/db/postgres";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const sessions = await deviceSession.getByUserId(payload.userId); // sudah ada

  return NextResponse.json({
    success: true,
    data: sessions.map((s) => ({
      id: s.id,
      device: s.device,
      created_at: s.created_at,
      last_active: s.created_at, 
      isCurrent: s.id === payload.sessionId,
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  // hapus semua lalu aktifkan kembali yang current
  await deviceSession.hapusSemua(payload.userId); // sudah ada
  // buat ulang sesi current tetap aktif tidak bisa, jadi skip sesi current saja
  await sql`UPDATE device_sessions SET is_active = true WHERE id = ${payload.sessionId}`;

  return NextResponse.json({ success: true, message: "Semua sesi lain berhasil dihapus" });
}


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

  await sql`
    UPDATE device_sessions
    SET is_active = false
    WHERE user_id = ${payload.userId}
      AND id != ${payload.sessionId}
  `;

  return NextResponse.json({ success: true, message: "Semua sesi lain berhasil dihapus" });
}


import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import sql from "@/db/postgres";
import { ApiResponse } from "@/utils/types";

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const users = await sql`
      SELECT id, name, email, telp, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, message: "OK", data: users } satisfies ApiResponse<Record<string, unknown>[]>);
  } catch {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" } satisfies ApiResponse, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const { user_id, is_active, role } = await req.json();

    if (!user_id) {
      return NextResponse.json({ success: false, message: "user_id wajib diisi" } satisfies ApiResponse, { status: 400 });
    }

    // Cegah admin nonaktifkan dirinya sendiri
    if (user_id === payload.userId && is_active === false) {
      return NextResponse.json({ success: false, message: "Tidak bisa menonaktifkan akun sendiri" } satisfies ApiResponse, { status: 400 });
    }

    if (is_active !== undefined) {
      await sql`UPDATE users SET is_active = ${is_active} WHERE id = ${user_id}`;
    }

    if (role !== undefined) {
      await sql`UPDATE users SET role = ${role} WHERE id = ${user_id}`;
    }

    return NextResponse.json({ success: true, message: "Berhasil diperbarui" } satisfies ApiResponse);
  } catch {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" } satisfies ApiResponse, { status: 500 });
  }
}
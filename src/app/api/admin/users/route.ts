import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import sql from "@/db/postgres";
import { sendSubscriptionActivatedEmail } from "@/lib/mailer";
import { deviceSession } from "@/domain/DeviceSession";
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

    const { searchParams } = req.nextUrl;
    const sortBy = searchParams.get("sortBy") ?? "created_at";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const allowedSortColumns: Record<string, string> = {
      name: "u.name",
      email: "u.email",
      created_at: "u.created_at",
      last_usage_at: "last_log.interacted_at",
    };
    const sortColumn = allowedSortColumns[sortBy] ?? "u.created_at";

    const users = sortOrder === "asc"
      ? await sql`
          SELECT 
            u.id, u.name, u.email, u.telp, u.role, u.is_active, u.created_at,
            sp.plan_name as current_plan,
            spe.end_date as subscription_end,
            last_log.interacted_at as last_usage_at,
            last_log.model_display_name as last_usage_model
          FROM users u
          LEFT JOIN subscription_periods spe 
            ON spe.user_id = u.id AND spe.is_active = true AND spe.end_date >= CURRENT_DATE
          LEFT JOIN subscription_plans sp ON sp.id = spe.plan_id
          LEFT JOIN LATERAL (
            SELECT il.interacted_at, m.display_name as model_display_name
            FROM interaction_logs il
            JOIN models m ON m.id = il.model_id
            WHERE il.user_id = u.id
            ORDER BY il.interacted_at DESC
            LIMIT 1
          ) last_log ON true
          ORDER BY ${sql(sortColumn)} ASC NULLS LAST
        `
      : await sql`
          SELECT 
            u.id, u.name, u.email, u.telp, u.role, u.is_active, u.created_at,
            sp.plan_name as current_plan,
            spe.end_date as subscription_end,
            last_log.interacted_at as last_usage_at,
            last_log.model_display_name as last_usage_model
          FROM users u
          LEFT JOIN subscription_periods spe 
            ON spe.user_id = u.id AND spe.is_active = true AND spe.end_date >= CURRENT_DATE
          LEFT JOIN subscription_plans sp ON sp.id = spe.plan_id
          LEFT JOIN LATERAL (
            SELECT il.interacted_at, m.display_name as model_display_name
            FROM interaction_logs il
            JOIN models m ON m.id = il.model_id
            WHERE il.user_id = u.id
            ORDER BY il.interacted_at DESC
            LIMIT 1
          ) last_log ON true
          ORDER BY ${sql(sortColumn)} DESC NULLS LAST
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

    if (user_id === payload.userId && is_active === false) {
      return NextResponse.json({ success: false, message: "Tidak bisa menonaktifkan akun sendiri" } satisfies ApiResponse, { status: 400 });
    }

    if (is_active !== undefined) {
      await sql`UPDATE users SET is_active = ${is_active} WHERE id = ${user_id}`;
      if (is_active === false) {
        await deviceSession.hapusSemua(user_id);
      }
    }

    if (role !== undefined) {
      await sql`UPDATE users SET role = ${role} WHERE id = ${user_id}`;
    }

    return NextResponse.json({ success: true, message: "Berhasil diperbarui" } satisfies ApiResponse);
  } catch {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" } satisfies ApiResponse, { status: 500 });
  }
}
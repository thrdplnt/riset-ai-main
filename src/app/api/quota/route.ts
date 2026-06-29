import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { tokenBalance } from "@/domain/TokenBalance";
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
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      } satisfies ApiResponse, { status: 401 });
    }

    const modelId = req.nextUrl.searchParams.get("model_id");
    if (!modelId) {
      return NextResponse.json({
        success: false,
        message: "model_id wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    const balance = await tokenBalance.getOrCreate(payload.userId, modelId);

    let planName: string | null = null;
    let expiresAt: string | null = null;

    const periodRows = await sql`
      SELECT sp.end_date, pl.plan_name
      FROM subscription_periods sp
      JOIN subscription_plans pl ON pl.id = sp.plan_id
      WHERE sp.user_id = ${payload.userId}
        AND sp.is_active = true
        AND sp.end_date >= CURRENT_DATE
      LIMIT 1
    `;

    if (periodRows.length > 0) {
      planName = periodRows[0].plan_name;
      expiresAt = periodRows[0].end_date;
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil ambil quota",
      data: balance ? {
        remaining_quota: balance.remaining_quota,
        total_quota: balance.total_quota,
        plan_name: planName,
        expires_at: expiresAt,
      } : null,
    } satisfies ApiResponse<{
      remaining_quota: number;
      total_quota: number;
      plan_name: string | null;
      expires_at: string | null;
    } | null>);

  } catch (error) {
    console.error("GET quota error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
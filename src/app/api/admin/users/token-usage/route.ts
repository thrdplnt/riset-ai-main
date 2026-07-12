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
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "user_id wajib diisi" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Ambil info plan aktif user
    const period = await sql`
      SELECT sp.plan_name, spe.end_date
      FROM subscription_periods spe
      JOIN subscription_plans sp ON sp.id = spe.plan_id
      WHERE spe.user_id = ${userId}
        AND spe.is_active = true
        AND spe.end_date >= CURRENT_DATE
      LIMIT 1
    `;

    // Ambil token per model untuk user
    const tokens = await tokenBalance.getAllByUser(userId);

    return NextResponse.json({
      success: true,
      message: "OK",
      data: {
        plan: period.length > 0 ? {
          name: period[0].plan_name,
          expires: period[0].end_date,
        } : null,
        tokens,
      },
    } satisfies ApiResponse<{
      plan: { name: string; expires: string } | null;
      tokens: {
        model_id: string;
        display_name: string;
        remaining_quota: number | null;
        total_quota: number | null;
      }[];
    }>);

  } catch (error) {
    console.error("GET admin token-usage error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

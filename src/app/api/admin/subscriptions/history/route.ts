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
      return NextResponse.json(
        { success: false, message: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const user_id = req.nextUrl.searchParams.get("user_id");
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "user_id wajib diisi" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const history = await sql`
      SELECT
        spe.id,
        spe.start_date,
        spe.end_date,
        spe.is_active,
        spe.limit_snapshot,
        sp.plan_name
      FROM subscription_periods spe
      JOIN subscription_plans sp ON sp.id = spe.plan_id
      WHERE spe.user_id = ${user_id}
      ORDER BY spe.start_date DESC
    `;

    return NextResponse.json({
      success: true,
      message: "OK",
      data: history,
    } satisfies ApiResponse<Record<string, unknown>[]>);

  } catch (error: any) {
    console.error("GET subscriptions/history error:", error);
    return NextResponse.json(
      { success: false, message: error.message ?? "Terjadi kesalahan server" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
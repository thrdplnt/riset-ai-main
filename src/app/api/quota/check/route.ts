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
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      } satisfies ApiResponse, { status: 401 });
    }

    const period = await sql`
      SELECT id FROM subscription_periods
      WHERE user_id = ${payload.userId}
        AND is_active = true
        AND end_date >= CURRENT_DATE
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      message: "OK",
      data: { has_subscription: period.length > 0 },
    } satisfies ApiResponse<{ has_subscription: boolean }>);

  } catch (error) {
    console.error("GET quota/check error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
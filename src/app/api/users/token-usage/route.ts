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

    // Ambil info plan aktif
    const period = await sql`
      SELECT sp.plan_name, spe.end_date
      FROM subscription_periods spe
      JOIN subscription_plans sp ON sp.id = spe.plan_id
      WHERE spe.user_id = ${payload.userId}
        AND spe.is_active = true
        AND spe.end_date >= CURRENT_DATE
      LIMIT 1
    `;

    // Ambil token per model
    const tokens = await tokenBalance.getAllByUser(payload.userId);

    // Ambil history interaksi
    const history = await sql`
    SELECT
        il.interacted_at,
        il.input_tokens,
        il.output_tokens,
        il.input_tokens + il.output_tokens AS total_tokens,
        m.display_name AS model_name
    FROM interaction_logs il
    JOIN models m ON m.id = il.model_id
    WHERE il.user_id = ${payload.userId}
    ORDER BY il.interacted_at DESC
    LIMIT 50
    ` as unknown as {
    interacted_at: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    model_name: string;
    }[];

    return NextResponse.json({
      success: true,
      message: "OK",
      data: {
        plan: period.length > 0 ? {
          name: period[0].plan_name,
          expires: period[0].end_date,
        } : null,
        tokens,
        history,
      },
    } satisfies ApiResponse<{
      plan: { name: string; expires: string } | null;
      tokens: {
        model_id: string;
        display_name: string;
        remaining_quota: number | null;
        total_quota: number | null;
      }[];
      history: {
        interacted_at: string;
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
        model_name: string;
      }[];
    }>);

  } catch (error) {
    console.error("GET token-usage error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
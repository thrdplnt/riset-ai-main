import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import sql from "@/db/postgres";
import { sendSubscriptionActivatedEmail } from "@/lib/mailer";
import { ApiResponse } from "@/utils/types";

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

export async function GET(req: NextRequest) {
  // Ambil daftar plan untuk dropdown
  try {
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const plans = await sql`SELECT id, plan_name, price, duration, token_limit FROM subscription_plans ORDER BY price ASC`;
    return NextResponse.json({ success: true, message: "OK", data: plans } satisfies ApiResponse<Record<string, unknown>[]>);
  } catch {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" } satisfies ApiResponse, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const { user_id, plan_id } = await req.json();

    if (!user_id || !plan_id) {
      return NextResponse.json({ success: false, message: "user_id dan plan_id wajib diisi" } satisfies ApiResponse, { status: 400 });
    }

    const plan = await sql`SELECT * FROM subscription_plans WHERE id = ${plan_id}`;
    if (plan.length === 0) {
      return NextResponse.json({ success: false, message: "Plan tidak ditemukan" } satisfies ApiResponse, { status: 404 });
    }

    await sql`UPDATE subscription_periods SET is_active = false WHERE user_id = ${user_id} AND is_active = true`;

    const periodId = crypto.randomUUID();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan[0].duration);

    await sql`
      INSERT INTO subscription_periods (id, user_id, plan_id, start_date, end_date, is_active, limit_snapshot)
      VALUES (${periodId}, ${user_id}, ${plan_id}, ${startDate}, ${endDate}, true, ${plan[0].token_limit})
    `;

    await sql`DELETE FROM token_balance WHERE user_id = ${user_id}`;

    const user = await sql`SELECT email, name FROM users WHERE id = ${user_id}`;

    // Kirim email di background, tidak ditunggu (fire and forget)
    if (user.length > 0) {
    sendSubscriptionActivatedEmail(user[0].email, plan[0].plan_name, plan[0].token_limit)
        .catch((err) => console.error("Gagal kirim email notifikasi:", err));
    }

    return NextResponse.json({ success: true, message: "Subscription berhasil diaktifkan" } satisfies ApiResponse);

  } catch (error) {
    console.error("POST subscription error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" } satisfies ApiResponse, { status: 500 });
  }
}
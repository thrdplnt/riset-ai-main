import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import sql from "@/db/postgres";
import { sendSubscriptionActivatedEmail } from "@/lib/mailer";
import { changePlan } from "@/quota/changePlan";
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

    const user = await sql`SELECT email, name, role, verified_at FROM users WHERE id = ${user_id}`;
    if (user.length === 0) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" } satisfies ApiResponse, { status: 404 });
    }

    await changePlan(user_id, plan_id);

    if (!user[0].verified_at) {
      await sql`UPDATE users SET verified_at = NOW() WHERE id = ${user_id}`;
    }

    if (user[0].role !== "admin") {
      sendSubscriptionActivatedEmail(user[0].email, plan[0].plan_name, plan[0].token_limit)
        .catch((err) => console.error("Gagal kirim email notifikasi:", err));
    }

    return NextResponse.json({ success: true, message: "Subscription berhasil diaktifkan" } satisfies ApiResponse);

  } catch (error: any) {
    console.error("POST subscription error:", error);
    return NextResponse.json(
      { success: false, message: error.message ?? "Terjadi kesalahan server" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const { plan_id, token_limit } = await req.json();

    if (!plan_id || typeof token_limit !== "number" || token_limit < 0) {
      return NextResponse.json({
        success: false,
        message: "plan_id dan token_limit (angka >= 0) wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    const existing = await sql`SELECT id FROM subscription_plans WHERE id = ${plan_id}`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Plan tidak ditemukan" } satisfies ApiResponse, { status: 404 });
    }

    await sql`UPDATE subscription_plans SET token_limit = ${token_limit} WHERE id = ${plan_id}`;

    return NextResponse.json({ success: true, message: "Token limit berhasil diperbarui" } satisfies ApiResponse);

  } catch (error: any) {
    console.error("PUT subscription plan error:", error);
    return NextResponse.json(
      { success: false, message: error.message ?? "Terjadi kesalahan server" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
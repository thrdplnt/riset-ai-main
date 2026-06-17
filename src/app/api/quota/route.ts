import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { DompetToken } from "@/domain/TokenBalance";
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

    const balance = await DompetToken.getOrCreate(payload.userId, modelId);

    return NextResponse.json({
      success: true,
      message: "Berhasil ambil quota",
      data: balance ? {
        remaining_quota: balance.remaining_quota,
        total_quota: balance.total_quota,
      } : null,
    } satisfies ApiResponse<{ remaining_quota: number; total_quota: number } | null>);

  } catch (error) {
    console.error("GET quota error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
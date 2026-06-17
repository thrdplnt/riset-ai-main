import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { RuangObrolan } from "@/domain/ChatRoom";
import { ApiResponse } from "@/utils/types";

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

// GET — ambil semua chat room user
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

    const chats = await RuangObrolan.getByUserId(payload.userId);

    return NextResponse.json({
      success: true,
      message: "Berhasil ambil daftar chat",
      data: chats,
    } satisfies ApiResponse<typeof chats>);

  } catch (error) {
    console.error("GET chat error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}

// POST — buat chat room baru
export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      } satisfies ApiResponse, { status: 401 });
    }

    const { title } = await req.json();
    const chat = await RuangObrolan.buatBaru(
      payload.userId,
      title || "New Chat"
    );

    return NextResponse.json({
      success: true,
      message: "Chat berhasil dibuat",
      data: chat,
    } satisfies ApiResponse<typeof chat>, { status: 201 });

  } catch (error) {
    console.error("POST chat error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
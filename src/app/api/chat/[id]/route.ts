import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { RuangObrolan } from "@/domain/ChatRoom";
import { LogInteraksi } from "@/domain/InteractionLog";
import { ApiResponse } from "@/utils/types";

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

// GET — ambil history chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      } satisfies ApiResponse, { status: 401 });
    }

    const chat = await RuangObrolan.findById(id);
    if (!chat || chat.user_id !== payload.userId) {
      return NextResponse.json({
        success: false,
        message: "Chat tidak ditemukan",
      } satisfies ApiResponse, { status: 404 });
    }

    const history = await LogInteraksi.getAllByRoomId(id);

    return NextResponse.json({
      success: true,
      message: "Berhasil ambil history",
      data: { chat, history },
    } satisfies ApiResponse<{ chat: typeof chat; history: typeof history }>);

  } catch (error) {
    console.error("GET chat/[id] error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}

// DELETE — hapus chat room
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      } satisfies ApiResponse, { status: 401 });
    }

    const chat = await RuangObrolan.findById(id);
    if (!chat || chat.user_id !== payload.userId) {
      return NextResponse.json({
        success: false,
        message: "Chat tidak ditemukan",
      } satisfies ApiResponse, { status: 404 });
    }

    await RuangObrolan.hapus(id);

    return NextResponse.json({
      success: true,
      message: "Chat berhasil dihapus",
    } satisfies ApiResponse);

  } catch (error) {
    console.error("DELETE chat/[id] error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
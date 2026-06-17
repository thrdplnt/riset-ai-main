import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { RuangObrolan } from "@/domain/ChatRoom";
import { LogInteraksi } from "@/domain/InteractionLog";
import { checkQuota } from "@/quota/check";
import { deductTokens } from "@/quota/deduct";
import { getModelConfig, callLLM } from "@/providers";
import { ApiResponse } from "@/utils/types";

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

const SYSTEM_PROMPT = "You are a helpful AI assistant.";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Autentikasi
    const token = getToken(req);
    const payload = await verifyJwt(token!);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      } satisfies ApiResponse, { status: 401 });
    }

    const { prompt, model_id } = await req.json();

    if (!prompt || !model_id) {
      return NextResponse.json({
        success: false,
        message: "Prompt dan model wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    // 2. Validasi chat room
    const chat = await RuangObrolan.findById(id);
    if (!chat || chat.user_id !== payload.userId) {
      return NextResponse.json({
        success: false,
        message: "Chat tidak ditemukan",
      } satisfies ApiResponse, { status: 404 });
    }

    // 3. Ambil config model
    const modelConfig = await getModelConfig(model_id);

    // 4. Ambil history chat
    const logs = await LogInteraksi.getByRoomId(id, 20);
    const history = LogInteraksi.toHistory(logs);

    // 5. Pre-flight check quota
    let quotaResult;
    try {
      quotaResult = await checkQuota(
        payload.userId,
        model_id,
        prompt,
        history,
        SYSTEM_PROMPT,
        modelConfig
      );
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        message: err.message ?? "Kuota token habis",
      } satisfies ApiResponse, { status: 403 });
    }

    // 6. Panggil LLM
    const llmResponse = await callLLM(
      modelConfig,
      { prompt, history },
      quotaResult.remaining_quota,
      quotaResult.input_tokens
    );

    // 7. Simpan interaction log
    await LogInteraksi.simpan({
      room_id: id,
      model_id,
      user_id: payload.userId,
      prompt_text: prompt,
      response_text: llmResponse.text,
      input_tokens: llmResponse.input_tokens,
      output_tokens: llmResponse.output_tokens,
    });

    // 8. Kurangi token balance
    await deductTokens(
      quotaResult.balance_id,
      llmResponse.input_tokens,
      llmResponse.output_tokens
    );

    // 9. Update title chat kalau masih "New Chat"
    if (chat.title === "New Chat") {
      await chat.updateTitle(prompt.slice(0, 50));
    }

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil dikirim",
      data: {
        response: llmResponse.text,
        input_tokens: llmResponse.input_tokens,
        output_tokens: llmResponse.output_tokens,
        remaining_quota: quotaResult.remaining_quota - llmResponse.input_tokens - llmResponse.output_tokens,
        warning: quotaResult.warning,
      },
    } satisfies ApiResponse<{
        response: string;
        input_tokens: number;
        output_tokens: number;
        remaining_quota: number;
        warning: string | undefined;
    }>);

  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
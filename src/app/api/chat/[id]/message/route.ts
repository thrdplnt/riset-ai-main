import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { chatRoom } from "@/domain/ChatRoom";
import { interactionLog, Attachment } from "@/domain/InteractionLog";
import { checkQuota } from "@/quota/check";
import { deductTokens } from "@/quota/deduct";
import { getModelConfig, callLLM } from "@/providers";
import { extractBase64 } from "@/providers/types";
import { extractPdfText } from "@/utils/pdfExtract";
import { extractDocxText } from "@/utils/docxExtract";
import { extractXlsxText } from "@/utils/xlsxExtract";
import { ApiResponse } from "@/utils/types";
import sql from "@/db/postgres";

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

export async function POST(
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

    const { prompt, model_id, attachments, timezone, web_search} = await req.json() as {
      prompt: string;
      model_id: string;
      attachments?: Attachment[];
      timezone?: string;
      web_search?: boolean;
    };
    
    if (!prompt || !model_id) {
      return NextResponse.json({
        success: false,
        message: "Prompt dan model wajib diisi",
      } satisfies ApiResponse, { status: 400 });
    }

    const tz = timezone || "Asia/Jakarta";
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: tz,
    });

    const SYSTEM_PROMPT = `You are a helpful AI assistant. Today is ${today} (timezone: ${tz}). When creating diagrams, ASCII art, tables of characters, or any visual representation using text characters, always wrap them inside triple backtick code blocks (\`\`\`) to preserve spacing and alignment. Never present ASCII art as plain text.`;

    const chat = await chatRoom.findById(id);
    if (!chat || chat.user_id !== payload.userId) {
      return NextResponse.json({
        success: false,
        message: "Chat tidak ditemukan",
      } satisfies ApiResponse, { status: 404 });
    }

    const modelConfig = await getModelConfig(model_id);
    const logs = await interactionLog.getByRoomId(id, 20);
    const history = interactionLog.toHistory(logs);

    const userLock = await sql`SELECT locked_until FROM users WHERE id = ${payload.userId}`;
    if (userLock.length > 0 && userLock[0].locked_until) {
      const lockedUntil = new Date(userLock[0].locked_until);
      const now = new Date();
      
      if (lockedUntil > now) {
        return NextResponse.json({
          success: false,
          message: "Harap tunggu, AI sedang memproses pesan Anda sebelumnya."
        } satisfies ApiResponse, { status: 429 }); // 429: Too Many Requests
      }
    }

    await sql`UPDATE users SET locked_until = NOW() + INTERVAL '60 seconds' WHERE id = ${payload.userId}`;

    try {

      let effectivePrompt = prompt;
      let llmAttachments: Attachment[] = attachments ?? [];

      if (attachments && attachments.length > 0) {
        const docxAttachments = attachments.filter((a) => a.type === "docx");
        const xlsxAttachments = attachments.filter((a) => a.type === "xlsx");
        const pdfAttachments = attachments.filter((a) => a.type === "pdf");
        const imageAttachments = attachments.filter((a) => a.type === "image");
        const extractedTexts: string[] = [];

        for (const docx of docxAttachments) {
          const base64 = extractBase64(docx.url);
          const text = await extractDocxText(base64);
          extractedTexts.push(`\n\n[Isi dokumen "${docx.name}"]:\n${text}`);
        }

        for (const xlsx of xlsxAttachments) {
          const base64 = extractBase64(xlsx.url);
          const text = await extractXlsxText(base64);
          extractedTexts.push(`\n\n[Isi spreadsheet "${xlsx.name}"]:\n${text}`);
        }

        for (const pdf of pdfAttachments) {
          const base64 = extractBase64(pdf.url);
          const text = await extractPdfText(base64);
          extractedTexts.push(`\n\n[Isi dokumen "${pdf.name}"]:\n${text}`);
        }

        if (extractedTexts.length > 0) {
          effectivePrompt = `${effectivePrompt}${extractedTexts.join("")}`;
        }
        llmAttachments = imageAttachments;
      }

      let quotaResult;
      try {
        quotaResult = await checkQuota(
          payload.userId,
          model_id,
          effectivePrompt,
          history,
          SYSTEM_PROMPT,
          modelConfig,
          llmAttachments
        );
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          message: err.message ?? "Kuota token habis",
        } satisfies ApiResponse, { status: 403 });
      }

      if (web_search && !modelConfig.supports_web_search) {
        return NextResponse.json({
          success: false,
          message: "Model yang dipilih tidak mendukung pencarian web",
        } satisfies ApiResponse, { status: 400 });
      }

      if (web_search && attachments && attachments.length > 0 && modelConfig.provider_id === 'openai') {
        return NextResponse.json({
          success: false,
          message: "Pencarian web pada OpenAI tidak dapat digunakan bersamaan dengan lampiran file",
        } satisfies ApiResponse, { status: 400 });
      }

      const llmResponse = await callLLM(
        modelConfig,
        { prompt: effectivePrompt, history, attachments: llmAttachments, system: SYSTEM_PROMPT, web_search },
        quotaResult.remaining_quota,
        quotaResult.input_tokens
      );

      const savedLog = await interactionLog.simpan({
        room_id: id,
        model_id,
        user_id: payload.userId,
        prompt_text: prompt,
        response_text: llmResponse.text,
        input_tokens: llmResponse.input_tokens,
        output_tokens: llmResponse.output_tokens,
        attachments: attachments ?? [],
        used_web_search: web_search ?? false,
      });

      await deductTokens(
        quotaResult.balance_id,
        llmResponse.input_tokens,
        llmResponse.output_tokens
      );

      if (chat.title === "New Chat") {
        await chat.updateTitle(prompt.slice(0, 50));
      }

      return NextResponse.json({
        success: true,
        message: "Pesan berhasil dikirim",
        data: {
          response: llmResponse.text,
          prompt_text: savedLog.prompt_text,
          interacted_at: savedLog.interacted_at,
          model_id: savedLog.model_display_name ?? model_id,
          estimated_input_tokens: quotaResult.input_tokens,
          input_tokens: llmResponse.input_tokens,
          output_tokens: llmResponse.output_tokens,
          remaining_quota: Math.max(
            quotaResult.remaining_quota - llmResponse.input_tokens - llmResponse.output_tokens,
            0
          ),
        },
      } satisfies ApiResponse<{
        response: string;
        prompt_text: string;
        interacted_at: Date;
        model_id: string;
        estimated_input_tokens: number;
        input_tokens: number;
        output_tokens: number;
        remaining_quota: number;
      }>);
      
    } finally {
      await sql`UPDATE users SET locked_until = NULL WHERE id = ${payload.userId}`;
    }

  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan server",
    } satisfies ApiResponse, { status: 500 });
  }
}
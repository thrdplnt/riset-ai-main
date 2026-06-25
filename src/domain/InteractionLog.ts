import sql from "@/db/postgres";
import { InteractionLog } from "@/utils/types";

export interface Attachment {
  name: string;
  type: "image" | "pdf";
  mime_type: string;
  url: string;
}

function parseAttachments(raw: unknown): Attachment[] {
  if (Array.isArray(raw)) return raw as Attachment[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export class LogInteraksi {
  id: string;
  room_id: string;
  model_id: string;
  user_id: string;
  prompt_text: string;
  response_text: string;
  input_tokens: number;
  output_tokens: number;
  interacted_at: Date;
  attachments: Attachment[];
  model_display_name?: string;

  constructor(data: InteractionLog & { attachments?: unknown; model_display_name?: string  }) {
    this.id = data.id;
    this.room_id = data.room_id;
    this.model_id = data.model_id;
    this.user_id = data.user_id;
    this.prompt_text = data.prompt_text;
    this.response_text = data.response_text;
    this.input_tokens = data.input_tokens;
    this.output_tokens = data.output_tokens;
    this.interacted_at = data.interacted_at;
    this.attachments = parseAttachments(data.attachments);
    this.model_display_name = data.model_display_name;
  }

  static async simpan(data: {
    room_id: string;
    model_id: string;
    user_id: string;
    prompt_text: string;
    response_text: string;
    input_tokens: number;
    output_tokens: number;
    attachments?: Attachment[];
    used_web_search?: boolean;
  }): Promise<LogInteraksi> {
    const id = crypto.randomUUID();
    const rows = await sql`
      INSERT INTO interaction_logs (
        id, room_id, model_id, user_id,
        prompt_text, response_text,
        input_tokens, output_tokens, interacted_at, attachments, used_web_search
      ) VALUES (
        ${id}, ${data.room_id}, ${data.model_id}, ${data.user_id},
        ${data.prompt_text}, ${data.response_text},
        ${data.input_tokens}, ${data.output_tokens}, NOW(),
        ${JSON.stringify(data.attachments ?? [])}, ${data.used_web_search ?? false}
      )
      RETURNING *
    `;
    return new LogInteraksi(rows[0] as unknown as InteractionLog & { attachments: unknown });
  }

  // Untuk dikirim ke LLM (context) — TETAP dibatasi 20 biar hemat token
  static async getByRoomId(
    roomId: string,
    limit: number = 20
  ): Promise<LogInteraksi[]> {
    const rows = await sql`
      SELECT * FROM interaction_logs
      WHERE room_id = ${roomId}
      ORDER BY interacted_at ASC
      LIMIT ${limit}
    `;
    return rows.map((r) => new LogInteraksi(r as unknown as InteractionLog & { attachments: unknown }));
  }

  static async getAllByRoomId(roomId: string): Promise<LogInteraksi[]> {
    const rows = await sql`
      SELECT il.*, m.display_name as model_display_name
      FROM interaction_logs il
      JOIN models m ON m.id = il.model_id
      WHERE il.room_id = ${roomId}
      ORDER BY il.interacted_at ASC
    `;
    return rows.map((r) => new LogInteraksi(r as unknown as InteractionLog & { attachments: unknown; model_display_name: string }));
  }

  static async getByUserId(userId: string): Promise<LogInteraksi[]> {
    const rows = await sql`
      SELECT il.*, m.display_name as model_display_name
      FROM interaction_logs il
      JOIN models m ON m.id = il.model_id
      WHERE il.user_id = ${userId}
      ORDER BY il.interacted_at DESC
    `;
    return rows.map((r) => new LogInteraksi(r as unknown as InteractionLog & { attachments: unknown }));
  }

  static toHistory(
    logs: LogInteraksi[]
  ): { role: "user" | "assistant"; content: string; attachments?: Attachment[] }[] {
    return logs.flatMap((log) => [
      { role: "user" as const, content: log.prompt_text, attachments: log.attachments },
      { role: "assistant" as const, content: log.response_text },
    ]);
  }
}
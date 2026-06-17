import sql from "@/db/postgres";
import { InteractionLog } from "@/utils/types";

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

  constructor(data: InteractionLog) {
    this.id = data.id;
    this.room_id = data.room_id;
    this.model_id = data.model_id;
    this.user_id = data.user_id;
    this.prompt_text = data.prompt_text;
    this.response_text = data.response_text;
    this.input_tokens = data.input_tokens;
    this.output_tokens = data.output_tokens;
    this.interacted_at = data.interacted_at;
  }

  static async simpan(data: {
    room_id: string;
    model_id: string;
    user_id: string;
    prompt_text: string;
    response_text: string;
    input_tokens: number;
    output_tokens: number;
  }): Promise<LogInteraksi> {
    const id = crypto.randomUUID();
    const rows = await sql`
      INSERT INTO interaction_logs (
        id, room_id, model_id, user_id,
        prompt_text, response_text,
        input_tokens, output_tokens, interacted_at
      ) VALUES (
        ${id}, ${data.room_id}, ${data.model_id}, ${data.user_id},
        ${data.prompt_text}, ${data.response_text},
        ${data.input_tokens}, ${data.output_tokens}, NOW()
      )
      RETURNING *
    `;
    return new LogInteraksi(rows[0] as InteractionLog);
  }

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
    return rows.map((r) => new LogInteraksi(r as InteractionLog));
  }

  static async getByUserId(userId: string): Promise<LogInteraksi[]> {
    const rows = await sql`
      SELECT il.*, m.display_name as model_display_name
      FROM interaction_logs il
      JOIN models m ON m.id = il.model_id
      WHERE il.user_id = ${userId}
      ORDER BY il.interacted_at DESC
    `;
    return rows.map((r) => new LogInteraksi(r as InteractionLog));
  }

  static toHistory(
    logs: LogInteraksi[]
  ): { role: "user" | "assistant"; content: string }[] {
    return logs.flatMap((log) => [
      { role: "user" as const, content: log.prompt_text },
      { role: "assistant" as const, content: log.response_text },
    ]);
  }
}
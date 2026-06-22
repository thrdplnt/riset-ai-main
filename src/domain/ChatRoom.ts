import sql from "@/db/postgres";
import { ChatRoom } from "@/utils/types";

export class RuangObrolan {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;

  constructor(data: ChatRoom) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.created_at = data.created_at;
  }

  static async buatBaru(userId: string, title: string): Promise<RuangObrolan> {
    const id = crypto.randomUUID();
    const rows = await sql`
      INSERT INTO chat_rooms (id, user_id, title, created_at)
      VALUES (${id}, ${userId}, ${title}, NOW())
      RETURNING *
    `;
    return new RuangObrolan(rows[0] as ChatRoom);
  }

  static async findById(id: string): Promise<RuangObrolan | null> {
    const rows = await sql`
      SELECT * FROM chat_rooms WHERE id = ${id} LIMIT 1
    `;
    if (rows.length === 0) return null;
    return new RuangObrolan(rows[0] as ChatRoom);
  }

  static async getByUserId(userId: string): Promise<RuangObrolan[]> {
    const rows = await sql`
      SELECT * FROM chat_rooms
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return rows.map((r) => new RuangObrolan(r as ChatRoom));
  }

  static async hapus(id: string): Promise<void> {
    // Hapus interaction_logs dulu (child) sebelum chat_rooms (parent)
    // karena ada foreign key constraint dari interaction_logs -> chat_rooms
    await sql`DELETE FROM interaction_logs WHERE room_id = ${id}`;
    await sql`DELETE FROM chat_rooms WHERE id = ${id}`;
  }

  async updateTitle(title: string): Promise<void> {
    await sql`
      UPDATE chat_rooms SET title = ${title} WHERE id = ${this.id}
    `;
    this.title = title;
  }
}
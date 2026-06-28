import sql from "@/db/postgres";
import { TokenBalance } from "@/utils/types";

export class DompetToken {
  id: string;
  user_id: string;
  model_id: string;
  period_id: string;
  remaining_quota: number;
  total_quota: number;
  created_at: Date;
  updated_at: Date;

  constructor(data: TokenBalance) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.model_id = data.model_id;
    this.period_id = data.period_id;
    this.remaining_quota = data.remaining_quota;
    this.total_quota = data.total_quota;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getOrCreate(
    userId: string,
    modelId: string
  ): Promise<DompetToken | null> {
    const modelExists = await sql`
      SELECT id FROM models WHERE id = ${modelId} AND is_active = true
    `;
    if (modelExists.length === 0) {
      throw new Error("Model tidak ditemukan atau sudah tidak aktif");
    }
    // Cek period aktif
    const period = await sql`
      SELECT id, limit_snapshot
      FROM subscription_periods
      WHERE user_id = ${userId}
        AND is_active = true
        AND end_date >= CURRENT_DATE
      LIMIT 1
    `;

    if (period.length === 0) return null;

    const periodId = period[0].id;
    const limitSnapshot = period[0].limit_snapshot;

    // Cek existing balance
    const existing = await sql`
      SELECT * FROM token_balance
      WHERE user_id = ${userId}
        AND model_id = ${modelId}
        AND period_id = ${periodId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return new DompetToken(existing[0] as TokenBalance);
    }

    // Buat baru on-demand
    const id = crypto.randomUUID();
    const rows = await sql`
      INSERT INTO token_balance (
        id, user_id, model_id, period_id,
        remaining_quota, total_quota, created_at, updated_at
      ) VALUES (
        ${id}, ${userId}, ${modelId}, ${periodId},
        ${limitSnapshot}, ${limitSnapshot}, NOW(), NOW()
      )
      RETURNING *
    `;

    return new DompetToken(rows[0] as TokenBalance);
  }

  static async getAllByUser(userId: string): Promise<{
    model_id: string;
    display_name: string;
    remaining_quota: number | null;
    total_quota: number | null;
  }[]> {
    const rows = await sql`
      SELECT
        m.id as model_id,
        m.display_name,
        tb.remaining_quota,
        tb.total_quota
      FROM models m
      LEFT JOIN token_balance tb
        ON tb.model_id = m.id
        AND tb.user_id = ${userId}
        AND tb.period_id = (
          SELECT id FROM subscription_periods
          WHERE user_id = ${userId}
            AND is_active = true
            AND end_date >= CURRENT_DATE
          LIMIT 1
        )
      WHERE m.is_active = true
      ORDER BY m.display_name ASC
    `;
    return rows as unknown as {
      model_id: string;
      display_name: string;
      remaining_quota: number | null;
      total_quota: number | null;
    }[];
  }

  cukup(): boolean {
    return this.remaining_quota > 0;
  }

  async kurangi(inputTokens: number, outputTokens: number): Promise<void> {
    const total = inputTokens + outputTokens;
    await sql`
      UPDATE token_balance
      SET remaining_quota = GREATEST(remaining_quota - ${total}, 0),
          updated_at = NOW()
      WHERE id = ${this.id}
    `;
    this.remaining_quota = Math.max(this.remaining_quota - total, 0);
  }
}
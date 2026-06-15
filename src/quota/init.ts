import sql from '@/db/postgres';
import { randomUUID } from 'crypto';

export async function initTokenBalance(
  user_id: string,
  model_id: string
): Promise<{ balance_id: string; remaining_quota: number }> {

  const existing = await sql`
    SELECT tb.id, tb.remaining_quota
    FROM token_balance tb
    JOIN subscription_periods sp ON tb.period_id = sp.id
    WHERE tb.user_id = ${user_id}
      AND tb.model_id = ${model_id}
      AND sp.is_active = true
      AND sp.end_date >= CURRENT_DATE
  `;

  if (existing.length > 0) {
    return {
      balance_id:      existing[0].id,
      remaining_quota: existing[0].remaining_quota,
    };
  }

  const period = await sql`
    SELECT id, limit_snapshot
    FROM subscription_periods
    WHERE user_id = ${user_id}
      AND is_active = true
      AND end_date >= CURRENT_DATE
    LIMIT 1
  `;

  if (period.length === 0) {
    throw new Error('User tidak memiliki subscription aktif');
  }

  const id = randomUUID();
  await sql`
    INSERT INTO token_balance
      (id, user_id, model_id, period_id, remaining_quota, total_quota, created_at, updated_at)
    VALUES
      (${id}, ${user_id}, ${model_id}, ${period[0].id},
       ${period[0].limit_snapshot}, ${period[0].limit_snapshot},
       NOW(), NOW())
  `;

  return {
    balance_id:      id,
    remaining_quota: period[0].limit_snapshot,
  };
}
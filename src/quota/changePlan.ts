import sql from '@/db/postgres';
import { randomUUID } from 'crypto';

export async function changePlan(
  user_id: string,
  new_plan_id: string
): Promise<{ period_id: string }> {

  const plan = await sql`
    SELECT token_limit, duration FROM subscription_plans WHERE id = ${new_plan_id}
  `;
  if (plan.length === 0) {
    throw new Error('Plan tidak ditemukan');
  }
  const { token_limit, duration } = plan[0];

  const oldPeriod = await sql`
    SELECT id, end_date FROM subscription_periods
    WHERE user_id = ${user_id} AND is_active = true AND end_date >= CURRENT_DATE
    LIMIT 1
  `;

  let oldBalances: Record<string, number> = {};
  if (oldPeriod.length > 0) {
    const rows = await sql`
      SELECT model_id, remaining_quota
      FROM token_balance
      WHERE period_id = ${oldPeriod[0].id}
    `;
    for (const r of rows) {
      oldBalances[r.model_id] = r.remaining_quota;
    }

    await sql`
      UPDATE subscription_periods SET is_active = false WHERE id = ${oldPeriod[0].id}
    `;
  }

  const new_period_id = randomUUID();
  const hasActiveOldPeriod = oldPeriod.length > 0;
  const endDateExpr = hasActiveOldPeriod
    ? sql`${oldPeriod[0].end_date}::date + ${duration}::int`
    : sql`CURRENT_DATE + ${duration}::int`;

  await sql`
    INSERT INTO subscription_periods
      (id, user_id, plan_id, start_date, end_date, is_active, limit_snapshot)
    VALUES
      (${new_period_id}, ${user_id}, ${new_plan_id},
       CURRENT_DATE, ${endDateExpr},
       true, ${token_limit})
  `;

  const allModels = await sql`
    SELECT id FROM models WHERE is_active = true
  `;

  for (const model of allModels) {
    const sisa = oldBalances[model.id] ?? 0;
    const accumulated = token_limit + sisa;
    const id = randomUUID();

    await sql`
      INSERT INTO token_balance
        (id, user_id, model_id, period_id, remaining_quota, total_quota, created_at, updated_at)
      VALUES
        (${id}, ${user_id}, ${model.id}, ${new_period_id},
         ${accumulated}, ${accumulated}, NOW(), NOW())
    `;
  }

  return { period_id: new_period_id };
}
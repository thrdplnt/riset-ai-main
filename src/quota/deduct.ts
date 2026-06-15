import sql from '@/db/postgres';

export async function deductTokens(
  balance_id: string,
  input_tokens: number,
  output_tokens: number
): Promise<void> {
  const total = input_tokens + output_tokens;

  await sql`
    UPDATE token_balance
    SET
      remaining_quota = GREATEST(remaining_quota - ${total}, 0),
      updated_at = NOW()
    WHERE id = ${balance_id}
  `;
}
import { initTokenBalance } from './init';
import { estimateTotalTokens } from './estimate';
import { ModelConfig } from '@/providers/types';

export interface QuotaCheckResult {
  balance_id: string;
  remaining_quota: number;
  input_tokens: number;
  warning?: string;
}

export async function checkQuota(
  user_id: string,
  model_id: string,
  prompt: string,
  history: { role: string; content: string }[],
  system_prompt: string,
  config: ModelConfig
): Promise<QuotaCheckResult> {

  const balance = await initTokenBalance(user_id, model_id);

  if (balance.remaining_quota <= 0) {
    throw new Error('Kuota token habis');
  }

  const estimated = await estimateTotalTokens(
    config.provider_id,
    config.base_url,
    config.model_name,
    prompt,
    history,
    system_prompt,
    balance.remaining_quota
  );

  let warning: string | undefined;
  if (balance.remaining_quota < estimated) {
    warning = `Sisa kuota mungkin tidak mencukupi (estimasi ±${estimated} token, sisa ${balance.remaining_quota} token). Respons mungkin terpotong.`;
  }

  return {
    balance_id: balance.balance_id,
    remaining_quota: balance.remaining_quota,
    input_tokens: estimated,
    warning,
  };
}
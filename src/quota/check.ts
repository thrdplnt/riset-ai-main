import { initTokenBalance } from './init';
import { estimateTotalTokens } from './estimate';
import { ModelConfig } from '@/providers/types';

function getMinimumOutputBudget(config: ModelConfig): number {
  const maxOutput = config.max_output_tokens || 1024;
  return Math.max(64, Math.min(512, Math.floor(maxOutput / 4)));
}

export interface QuotaCheckResult {
  balance_id: string;
  remaining_quota: number;
  input_tokens: number;
  // warning?: string;
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

  const input_tokens = await estimateTotalTokens(
    config.provider_id,
    config.base_url,
    config.model_name,
    prompt,
    history,
    system_prompt,
    balance.remaining_quota
  );

  const minimumOutputBudget = getMinimumOutputBudget(config);

  if (input_tokens > config.max_input_tokens) {
    throw new Error(
      `Prompt dan riwayat percakapan terlalu panjang untuk model ini (±${input_tokens.toLocaleString()} token, batas maksimum ${config.max_input_tokens.toLocaleString()} token)`
    );
  }

  if (input_tokens + minimumOutputBudget > balance.remaining_quota) {
    throw new Error(
      `Saldo token tidak mencukupi untuk prompt ini dan ruang jawaban minimal. Estimasi input ±${input_tokens.toLocaleString()}, sisa saldo ${balance.remaining_quota.toLocaleString()}, minimal untuk jawaban ${minimumOutputBudget.toLocaleString()} token.`
    );
  }

  return {
    balance_id: balance.balance_id,
    remaining_quota: balance.remaining_quota,
    input_tokens,
    // warning,
  };
}
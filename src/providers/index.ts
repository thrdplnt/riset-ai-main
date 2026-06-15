// src/providers/index.ts

import { callOpenAI } from './openai';
import { callGemini } from './gemini';
import { callAnthropic } from './anthropic';
import { LLMRequest, LLMResponse, ModelConfig } from './types';
import sql from "@/db/postgres";

export async function getModelConfig(model_id: string): Promise<ModelConfig> {
  const rows = await sql`
    SELECT m.model_name, m.provider_id, p.base_url, m.max_context_length, p.base_url
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.id = ${model_id} AND m.is_active = true
  `;

  if (rows.length === 0) throw new Error('Model tidak ditemukan atau tidak aktif');
  return rows[0] as ModelConfig;
}

export async function callLLM(
  config: ModelConfig,
  req: LLMRequest,
  remaining_quota: number,
  input_tokens: number
): Promise<LLMResponse> {

  let effectiveMaxOutput: number;

  if (remaining_quota !== undefined && input_tokens !== undefined) {
    // Normal flow — dari checkQuota
    effectiveMaxOutput = Math.max(
      Math.min(
        config.max_context_length - input_tokens,
        remaining_quota - input_tokens
      ),
      1
    );
  } else {
    // Test flow — tidak ada quota, pakai max_context_length penuh
    effectiveMaxOutput = config.max_context_length;
  }


  const safeReq = { ...req, quota_limit: effectiveMaxOutput };
  switch (config.provider_id) {
    case 'openai':    return callOpenAI(config, safeReq);
    case 'gemini':    return callGemini(config, safeReq);
    case 'claude': return callAnthropic(config, safeReq);
    default:
      throw new Error(`Provider tidak dikenali: ${config.provider_id}`);
  }
}
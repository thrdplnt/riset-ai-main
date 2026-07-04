// src/providers/index.ts

import { callOpenAI } from './openai';
import { callGemini } from './gemini';
import { callAnthropic } from './anthropic';
import { LLMRequest, LLMResponse, ModelConfig } from './types';
import { supportsOpenAIWebSearch } from './openai';
import sql from "@/db/postgres";

export async function getModelConfig(model_id: string): Promise<ModelConfig> {
  const rows = await sql`
    SELECT m.model_name, m.provider_id, m.max_input_tokens, m.max_output_tokens, p.base_url
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.id = ${model_id} AND m.is_active = true
  `;

  if (rows.length === 0) throw new Error('Model tidak ditemukan atau tidak aktif');

  const config = rows[0] as ModelConfig;
  return {
    ...config,
    supports_web_search: modelSupportsWebSearch(config.provider_id, config.model_name),
  };
}

export async function callLLM(
  config: ModelConfig,
  req: LLMRequest,
  remaining_quota: number,
  input_tokens: number
): Promise<LLMResponse> {

  if (input_tokens !== undefined && input_tokens > config.max_input_tokens) {
    throw new Error(
      `Prompt dan riwayat percakapan terlalu panjang untuk model ini (±${input_tokens.toLocaleString()} token, batas maksimum ${config.max_input_tokens.toLocaleString()} token)`
    );
  }

  let effectiveMaxOutput: number;

  if (remaining_quota !== undefined && input_tokens !== undefined) {

    effectiveMaxOutput = Math.max(
      Math.min(
        config.max_output_tokens,
        config.max_input_tokens - input_tokens,
        remaining_quota - input_tokens
      ),
      0
    );

  } else {
    effectiveMaxOutput = config.max_output_tokens;
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

export function modelSupportsWebSearch(provider_id: string, model_name: string): boolean {
  if (provider_id === 'openai') return supportsOpenAIWebSearch(model_name);
  if (provider_id === 'gemini') return true;      
  if (provider_id === 'claude') return true;   
  return false;
}
// src/providers/index.ts

import { callOpenAI } from './openai';
import { callGemini } from './gemini';
import { callAnthropic } from './anthropic';
import { LLMRequest, LLMResponse, ModelConfig } from './types';
import sql from '@/db';

export async function getModelConfig(model_id: string): Promise<ModelConfig> {
  const rows = await sql`
    SELECT m.model_name, m.provider_id, p.base_url
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.id = ${model_id} AND m.is_active = true
  `;

  if (rows.length === 0) throw new Error('Model tidak ditemukan atau tidak aktif');
  return rows[0] as ModelConfig;
}

export async function callLLM(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  switch (config.provider_id) {
    case 'openai':    return callOpenAI(config, req);
    case 'gemini':    return callGemini(config, req);
    case 'claude': return callAnthropic(config, req);
    default:
      throw new Error(`Provider tidak dikenali: ${config.provider_id}`);
  }
}
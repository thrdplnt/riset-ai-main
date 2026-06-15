// src/providers/anthropic.ts

import { LLMRequest, LLMResponse, ModelConfig } from './types';

export async function callAnthropic(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  const messages = [
    ...(req.history ?? []),
    { role: 'user', content: req.prompt },
  ];

  const res = await fetch(`${config.base_url}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model_name,
      max_tokens: 1024,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();

  return {
    text: data.content[0].text,
    input_tokens: data.usage.input_tokens,
    output_tokens: data.usage.output_tokens,
  };
}
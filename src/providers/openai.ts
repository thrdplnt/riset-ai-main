// src/providers/openai.ts

import { LLMRequest, LLMResponse, ModelConfig } from './types';

export async function callOpenAI(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  const messages = [
    ...(req.history ?? []),
    { role: 'user', content: req.prompt },
  ];

  const res = await fetch(`${config.base_url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: config.model_name, messages }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();

  return {
    text: data.choices[0].message.content,
    input_tokens: data.usage.prompt_tokens,
    output_tokens: data.usage.completion_tokens,
  };
}
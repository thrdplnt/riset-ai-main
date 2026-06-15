// src/providers/anthropic.ts

import { LLMRequest, LLMResponse, ModelConfig } from './types';

export async function callAnthropic(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {

  const rawMessages = [
    ...(req.history ?? []),
    { role: 'user', content: req.prompt },
  ];

  const messages: { role: string; content: string }[] = [];
  for (const msg of rawMessages) {
    const lastMsg = messages[messages.length - 1];
    
    if (lastMsg && lastMsg.role === msg.role) {

      lastMsg.content += `\n\n${msg.content}`;
    } else {

      messages.push({ role: msg.role, content: msg.content });
    }
  }

  if (messages.length > 0 && messages[0].role !== 'user') {
    messages.shift(); 
  }

  const res = await fetch(`${config.base_url}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model_name,
      max_tokens: req.quota_limit,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();

  return {
    text: data.content[0].text,
    input_tokens: data.usage.input_tokens,
    output_tokens: data.usage.output_tokens,
    is_truncated:  data.stop_reason === 'max_tokens',
  };
}
// src/providers/openai.ts

import { LLMRequest, LLMResponse, ModelConfig } from './types';

export async function callOpenAI(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  const history = req.history ?? [];

  let userContent: any = req.prompt;

  const images = (req.attachments ?? []).filter((a) => a.type === 'image');
  const pdfTexts = (req.attachments ?? []).filter((a) => a.type === 'pdf');

  if (images.length > 0 || pdfTexts.length > 0) {
    const contentParts: any[] = [];

    if (req.prompt) {
      contentParts.push({ type: 'text', text: req.prompt });
    }

    for (const img of images) {
      contentParts.push({
        type: 'image_url',
        image_url: { url: img.url },
      });
    }

    userContent = contentParts;
  }

  const messages = [
    ...(req.system ? [{ role: 'system', content: req.system }] : []), // ← FIX: system prompt
    ...history,
    { role: 'user', content: userContent },
  ];

  const res = await fetch(`${config.base_url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: config.model_name, messages, max_tokens: req.quota_limit }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();

  return {
    text: data.choices[0].message.content,
    input_tokens: data.usage.prompt_tokens,
    output_tokens: data.usage.completion_tokens,
    is_truncated: data.choices[0].finish_reason === 'length',
  };
}
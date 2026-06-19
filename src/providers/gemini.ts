// src/providers/gemini.ts

import { LLMRequest, LLMResponse, ModelConfig, extractBase64 } from './types';

export async function callGemini(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  const history = (req.history ?? []).map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  // Build parts untuk user message — text + attachments
  const userParts: any[] = [{ text: req.prompt }];

  for (const att of req.attachments ?? []) {
    userParts.push({
      inlineData: {
        mimeType: att.mime_type,
        data: extractBase64(att.url),
      },
    });
  }

  const contents = [
    ...history,
    { role: 'user', parts: userParts },
  ];

  const res = await fetch(
    `${config.base_url}/models/${config.model_name}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: req.quota_limit,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();

  return {
    text: data.candidates[0].content.parts[0].text,
    input_tokens: data.usageMetadata.promptTokenCount,
    output_tokens: data.usageMetadata.candidatesTokenCount,
    is_truncated: data.candidates[0].finishReason === 'MAX_TOKENS',
  };
}
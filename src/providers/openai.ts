// src/providers/openai.ts

import { LLMRequest, LLMResponse, ModelConfig } from './types';

const OPENAI_SEARCH_MODEL_MAP: Record<string, string> = {
  'gpt-4o-mini': 'gpt-4o-mini-search-preview',
  'gpt-4o': 'gpt-4o-search-preview',
  'gpt-5': 'gpt-5-search-api',
};

export function getOpenAISearchModel(model_name: string): string | null {
  return OPENAI_SEARCH_MODEL_MAP[model_name] ?? null;
}

export function supportsOpenAIWebSearch(model_name: string): boolean {
  return model_name in OPENAI_SEARCH_MODEL_MAP;
}

export async function callOpenAI(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  const history = req.history ?? [];
  let userContent: any = req.prompt;

  const images = (req.attachments ?? []).filter((a) => a.type === 'image');

  if (images.length > 0) {
    const contentParts: any[] = [];
    if (req.prompt) contentParts.push({ type: 'text', text: req.prompt });
    for (const img of images) {
      contentParts.push({ type: 'image_url', image_url: { url: img.url } });
    }
    userContent = contentParts;
  }

  const messages = [
    ...(req.system ? [{ role: 'system', content: req.system }] : []),
    ...history,
    { role: 'user', content: userContent },
  ];

  const effectiveModel = req.web_search
    ? (getOpenAISearchModel(config.model_name) ?? config.model_name)
    : config.model_name;

  const body: any = {
    model: effectiveModel,
    messages,
    max_tokens: req.quota_limit,
  };

  if (req.web_search && supportsOpenAIWebSearch(config.model_name)) {
    body.web_search_options = {};
  }

  const res = await fetch(`${config.base_url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('OpenAI error response:', errText);
    throw new Error(`OpenAI error: ${res.status}`);
  }

  const data = await res.json();

  return {
    text: data.choices[0].message.content,
    input_tokens: data.usage.prompt_tokens,
    output_tokens: data.usage.completion_tokens,
    is_truncated: data.choices[0].finish_reason === 'length',
  };
}
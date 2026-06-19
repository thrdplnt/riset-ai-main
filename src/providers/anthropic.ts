// src/providers/anthropic.ts

import { LLMRequest, LLMResponse, ModelConfig, extractBase64 } from './types';

export async function callAnthropic(
  config: ModelConfig,
  req: LLMRequest
): Promise<LLMResponse> {
  const history = req.history ?? [];

  // Build user content — text + attachments
  let userContent: any = req.prompt;
  const attachments = req.attachments ?? [];

  if (attachments.length > 0) {
    const contentParts: any[] = [];

    for (const att of attachments) {
      if (att.type === 'image') {
        contentParts.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: att.mime_type,
            data: extractBase64(att.url),
          },
        });
      } else if (att.type === 'pdf') {
        contentParts.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: extractBase64(att.url),
          },
        });
      }
    }

    contentParts.push({ type: 'text', text: req.prompt });
    userContent = contentParts;
  }

  const rawMessages = [
    ...history,
    { role: 'user', content: userContent },
  ];

  // Dedup consecutive same-role messages (logic asli dipertahankan)
  const messages: { role: string; content: any }[] = [];
  for (const msg of rawMessages) {
    const lastMsg = messages[messages.length - 1];

    if (lastMsg && lastMsg.role === msg.role && typeof lastMsg.content === 'string' && typeof msg.content === 'string') {
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
      'anthropic-beta': 'pdfs-2024-09-25', // perlu beta header untuk PDF support
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
    is_truncated: data.stop_reason === 'max_tokens',
  };
}
import { Attachment } from "@/providers/types";

function calculateImageTokens(
  provider_id: string,
  width: number = 1024, 
  height: number = 1024
): number {
  switch (provider_id) {
    case 'openai':
      // Asumsi mode "high detail": 85 base + (170 * jumlah tile 512x512)
      const tilesX = Math.ceil(width / 512);
      const tilesY = Math.ceil(height / 512);
      return 85 + (170 * (tilesX * tilesY));

    case 'claude':
      // Berbasis Area: Blok 28x28
      const blocksX = Math.ceil(width / 28);
      const blocksY = Math.ceil(height / 28);
      return blocksX * blocksY;

    case 'gemini':
      // Flat rate per tile
      if (width <= 384 && height <= 384) {
        return 258;
      }
      const geminiTilesX = Math.ceil(width / 768);
      const geminiTilesY = Math.ceil(height / 768);
      return 258 * (geminiTilesX * geminiTilesY);

    default:
      return 1000;
  }
}

async function countInputTokensOpenAI(
  base_url: string,
  model_name: string,
  prompt: string,
  history: any[],
  system_prompt: string
): Promise<number> {
  
  const cleanHistory = history.map(h => ({
    role: h.role,
    content: h.content
  }));

  const input = [
    ...cleanHistory,
    { role: 'user', content: prompt }
  ];

  const payload: any = {
    model: model_name,
    input: input,
  };

  if (system_prompt) {
    payload.instructions = system_prompt;
  }

  const res = await fetch(`${base_url}/responses/input_tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Detail Error dari OpenAI:", JSON.stringify(errorData, null, 2));
    
    throw new Error(`OpenAI Error: ${errorData.error?.message || 'Bad Request'}`);
  }

  const data = await res.json();
  return data.input_tokens ?? 0;
}

async function countInputTokensGemini(
  base_url: string,
  model_name: string,
  prompt: string,
  history: { role: string; content: string }[],
  system_prompt: string
): Promise<number> {
  const contents = [
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const res = await fetch(
    `${base_url}/models/${model_name}:countTokens?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: system_prompt
          ? { parts: [{ text: system_prompt }] }
          : undefined,
        contents,
      }),
    }
  );
  const data = await res.json();
  return data.totalTokens ?? fallbackEstimate(prompt, history, system_prompt);
}

async function countInputTokensAnthropic(
  base_url: string,
  model_name: string,
  prompt: string,
  history: { role: string; content: string }[],
  system_prompt: string
): Promise<number> {
  const messages = [
    ...history,
    { role: 'user', content: prompt }
  ];

  const res = await fetch(`${base_url}/messages/count_tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model_name,
      system: system_prompt || undefined,
      messages,
    }),
  });
  const data = await res.json();
  return data.input_tokens ?? fallbackEstimate(prompt, history, system_prompt);
}

function fallbackEstimate(
  prompt: string,
  history: { role: string; content: string }[],
  system_prompt: string
): number {
  const allText = [
    system_prompt,
    ...history.map(h => h.content),
    prompt
  ].join(' ');
  return Math.ceil(allText.length / 3.5);
}

export async function estimateTotalTokens(
  provider_id: string,
  base_url: string,
  model_name: string,
  prompt: string,
  history: { role: string; content: string }[],
  system_prompt: string,
  remaining_quota: number,
  attachments: Attachment[] = []
): Promise<number> {
  let input_tokens = 0;

  switch (provider_id) {
    case 'gemini':
      input_tokens = await countInputTokensGemini(
        base_url, model_name, prompt, history, system_prompt
      );
      break;
    case 'claude':
      input_tokens = await countInputTokensAnthropic(
        base_url, model_name, prompt, history, system_prompt
      );
      break;
    case 'openai':
    default:
      // input_tokens = fallbackEstimate(prompt, history, system_prompt);
      input_tokens = await countInputTokensOpenAI(
        base_url, model_name, prompt, history, system_prompt);
      break;
  }

  let image_tokens = 0;
  const imageAttachments = attachments.filter(a => a.type === 'image');
  
  for (const img of imageAttachments) {
    const w = img.width || 1024;
    const h = img.height || 1024;
    
    image_tokens += calculateImageTokens(provider_id, w, h);
  }

  const total_estimated_tokens = input_tokens + image_tokens;

  console.log(`[Estimasi Kuota] Teks: ${input_tokens} | Gambar: ${image_tokens} | Total: ${total_estimated_tokens}`);

  return total_estimated_tokens;
}
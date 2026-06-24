import { NextResponse } from 'next/server';
import sql from '@/db/postgres';

async function getBaseUrl(provider_id: string): Promise<string> {
  const rows = await sql`
    SELECT base_url FROM providers WHERE id = ${provider_id}
  `;
  if (rows.length === 0) throw new Error(`Provider ${provider_id} tidak ditemukan`);
  return rows[0].base_url;
}

function guessOpenAIContext(model_id: string): number {
  if (model_id.includes('gpt-5'))   return 400000;
  if (model_id.includes('gpt-4o'))  return 128000;
  if (model_id.includes('gpt-4'))   return 8192;
  if (model_id.includes('gpt-3.5')) return 16385;
  return 128000;
}

async function fetchOpenAIModels() {
  const base_url = await getBaseUrl('openai');
  const res = await fetch(`${base_url}/models`, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data
    .filter((m: any) => m.id.startsWith('gpt'))
    .map((m: any) => ({
      model_name: m.id,
      display_name: m.id,
      max_context_length: guessOpenAIContext(m.id),
    }));
}

async function fetchGeminiModels() {
  const base_url = await getBaseUrl('gemini');
  const res = await fetch(`${base_url}/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.models
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => ({
      model_name: m.name.replace('models/', ''),
      display_name: m.displayName,
      max_context_length: m.inputTokenLimit,
    }));
}

function guessAnthropicContext(model_id: string): number {
  if (model_id.startsWith('claude')) return 200000;
  return 200000;
}

async function fetchAnthropicModels() {
  const base_url = await getBaseUrl('claude');
  const res = await fetch(`${base_url}/models`, {
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data.map((m: any) => ({
    model_name: m.id,
    display_name: m.id,
    max_context_length: guessAnthropicContext(m.id),
  }));
}

export async function GET() {
  const [openai, gemini, anthropic] = await Promise.allSettled([
    fetchOpenAIModels(),
    fetchGeminiModels(),
    fetchAnthropicModels(),
  ]);

  return NextResponse.json({
    openai:    openai.status    === 'fulfilled' ? openai.value    : { error: openai.reason?.message },
    gemini:    gemini.status    === 'fulfilled' ? gemini.value    : { error: gemini.reason?.message },
    anthropic: anthropic.status === 'fulfilled' ? anthropic.value : { error: anthropic.reason?.message },
  });
}
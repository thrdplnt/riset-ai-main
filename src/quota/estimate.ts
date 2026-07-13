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
  remaining_quota: number
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

  return input_tokens;
}
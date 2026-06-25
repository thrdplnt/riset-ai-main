export function guessOpenAIInputLimit(model_id: string): number {
  if (model_id.includes('gpt-5'))   return 400000;
  if (model_id.includes('gpt-4o'))  return 128000;
  if (model_id.includes('gpt-4'))   return 8192;
  if (model_id.includes('gpt-3.5')) return 16385;
  return 128000;
}

export function guessOpenAIMaxOutput(model_id: string): number {
  if (model_id.includes('gpt-5'))   return 128000;
  if (model_id.includes('gpt-4o'))  return 16384;
  if (model_id.includes('gpt-4'))   return 8192;
  return 4096;
}

export function guessAnthropicInputLimit(model_id: string): number {
  if (/4-[6-9]|fable|mythos/.test(model_id)) return 1000000;
  if (model_id.includes('sonnet-4-5')) return 1000000;
  return 200000;
}

export function guessAnthropicMaxOutput(model_id: string): number {
  if (/4-[6-9]|fable|mythos/.test(model_id)) return 128000;
  if (model_id.includes('opus-4-5'))  return 64000;
  if (model_id.includes('haiku'))     return 64000;
  if (model_id.includes('sonnet'))    return 64000;
  if (model_id.includes('opus-4-1'))  return 32000;
  return 8096;
}

export function guessGeminiInputLimit(): number {
  return 1048576;
}

export function guessGeminiMaxOutput(): number {
  return 65536;
}

export function guessTokenLimits(provider_id: string, model_name: string): { max_input_tokens: number; max_output_tokens: number } {
  if (provider_id === 'openai') {
    return {
      max_input_tokens: guessOpenAIInputLimit(model_name),
      max_output_tokens: guessOpenAIMaxOutput(model_name),
    };
  }
  if (provider_id === 'claude') {
    return {
      max_input_tokens: guessAnthropicInputLimit(model_name),
      max_output_tokens: guessAnthropicMaxOutput(model_name),
    };
  }
  if (provider_id === 'gemini') {
    return {
      max_input_tokens: guessGeminiInputLimit(),
      max_output_tokens: guessGeminiMaxOutput(),
    };
  }
  return { max_input_tokens: 128000, max_output_tokens: 4096 };
}
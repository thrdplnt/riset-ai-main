// src/providers/types.ts

export interface LLMRequest {
  prompt: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface LLMResponse {
  text: string;
  input_tokens: number;
  output_tokens: number;
}

export interface ModelConfig {
  provider_id: string;
  model_name: string;
  base_url: string;        
}
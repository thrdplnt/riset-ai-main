// src/providers/types.ts

export interface LLMRequest {
  prompt: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  quota_limit?: number;
}

export interface LLMResponse {
  text: string;
  input_tokens: number;
  output_tokens: number;
  is_truncated: boolean;
}

export interface ModelConfig {
  provider_id: string;
  model_name: string;
  base_url: string;  
  max_context_length: number;      
}
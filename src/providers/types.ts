// src/providers/types.ts

export interface Attachment {
  name: string;
  type: 'image' | 'pdf' | 'docx' | 'xlsx';
  mime_type: string;
  url: string;
}

export interface LLMRequest {
  prompt: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  quota_limit?: number;
  attachments?: Attachment[];
  system?: string;
  web_search?: boolean;
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
  max_input_tokens: number;
  max_output_tokens: number;
  supports_web_search?: boolean;
}

export function extractBase64(dataUrl: string): string {
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : dataUrl;
}
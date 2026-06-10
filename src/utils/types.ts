export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  telp: string;
  role: UserRole;
  is_active: boolean;
  verified_at: Date | null;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  sessionId: string;
}

export interface DeviceSession {
  id: string;
  user_id: string;
  device: string;
  token: string;
  is_active: boolean;
  created_at: Date;
  expires_at: Date;
}

export interface Provider {
  id: string;
  provider_name: string;
  base_url: string;
}

export interface Model {
  id: string;
  provider_id: string;
  display_name: string;
  model_name: string;
  is_active: boolean;
}

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  price: number;
  duration: number;
  token_limit: number;
  created_at: Date;
}

export interface SubscriptionPeriod {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  limit_snapshot: number;
}

export interface TokenBalance {
  id: string;
  user_id: string;
  model_id: string;
  period_id: string;
  remaining_quota: number;
  total_quota: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChatRoom {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
}

export interface InteractionLog {
  id: string;
  room_id: string;
  model_id: string;
  user_id: string;
  prompt_text: string;
  response_text: string;
  input_tokens: number;
  output_tokens: number;
  interacted_at: Date;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LLMResponse {
  content: string;
  usage: TokenUsage;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}
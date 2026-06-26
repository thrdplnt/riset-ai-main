export const ROUTES = {
  //auth
  LOGIN:                    "/login",
  REGISTER:                 "/register",
  FORGOT_PASSWORD:          "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL:             "/verify-email",

  //chat
  CHAT:                     "/chat",
  CHAT_ROOM:                (id: string) => `/chat/${id}`,

  //settings 
  SETTINGS_ACCOUNT:         "/settings/account",
  SETTINGS_PASSWORD:        "/settings/password",
  SETTINGS_TOKEN_USAGE:     "/settings/token-usage",
  SETTINGS_SESSIONS:        "/settings/sessions",

  //admin
  ADMIN_USERS:              "/admin/users",
  ADMIN_MODELS:             "/admin/models",
} as const;
"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

interface AuthContextType {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { error: data.message };
      }

      // Simpan token ke cookie
      document.cookie = `token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      // Redirect berdasarkan role
      if (data.data.role === "admin") {
        router.push(ROUTES.ADMIN_USERS);
      } else {
        router.push(ROUTES.CHAT);
      }

      return {};
    } catch {
      return { error: "Terjadi kesalahan, coba lagi" };
    }
  };

  const logout = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    document.cookie = "token=; path=/; max-age=0";
    router.push(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
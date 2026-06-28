"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_CHECK_INTERVAL = 15000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const forceLogout = (message?: string) => {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("risetai_user");
    setUser(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (message) {
      sessionStorage.setItem("logout_reason", message);
    }
    router.push(ROUTES.LOGIN);
  };

  const checkSession = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      const res = await fetch("/api/auth/session-check");
      const data = await res.json();
      if (!data.success) {
        forceLogout("Sesi berakhir: Batas login 2 perangkat telah terlampaui. ");
      }
    } catch {
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("risetai_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    checkSession();
    intervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) return { error: data.message };

      document.cookie = `token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      const userInfo: AuthUser = {
        id: data.data.user?.id ?? "",
        name: data.data.user?.name ?? email.split("@")[0],
        email: data.data.user?.email ?? email,
        role: data.data.role,
      };
      localStorage.setItem("risetai_user", JSON.stringify(userInfo));
      setUser(userInfo);

      router.push(ROUTES.CHAT);

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

    forceLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
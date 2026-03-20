"use client";

import { create } from "zustand";
import { assignmentApi as _a } from "@/lib/api";
import { getToken, setToken, removeToken } from "@/lib/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  school?: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, school?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, school?: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

async function authRequest(path: string, body: object): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { success: boolean; data?: { token: string; user: AuthUser }; error?: string };
  if (!res.ok || !json.success) throw new Error(json.error || "Auth failed");
  return json.data!;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authRequest("/api/auth/login", { email, password });
      setToken(token);
      set({ user, token, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed", loading: false });
      throw err;
    }
  },

  register: async (name, email, password, school) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authRequest("/api/auth/register", { name, email, password, school });
      setToken(token);
      set({ user, token, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Registration failed", loading: false });
      throw err;
    }
  },

  logout: () => {
    removeToken();
    set({ user: null, token: null });
  },

  updateProfile: async (name, school) => {
    set({ loading: true, error: null });
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, school }),
      });
      const json = await res.json() as { success: boolean; data?: { token: string; user: AuthUser }; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error || "Update failed");

      setToken(json.data!.token);
      set({ user: json.data!.user, token: json.data!.token, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Update failed", loading: false });
      throw err;
    }
  },

  hydrate: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json() as { success: boolean; data?: AuthUser };
      if (json.success && json.data) {
        set({ user: json.data, token });
      } else {
        removeToken();
      }
    } catch {
      removeToken();
    }
  },
}));

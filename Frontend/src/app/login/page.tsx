"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_#fff7ed,_#f1f0ec_50%,_#e9e8e3)] flex flex-col p-4 sm:p-8">
      <div className="w-full max-w-md m-auto">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-700 text-lg font-black text-white shadow-lg shadow-orange-200">
            V
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">VedaAI</p>
            <p className="text-xs text-slate-500">Assessment studio</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your teacher workspace</p>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@school.edu"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 py-3 text-sm font-semibold text-white shadow-[0_0_0_2px_rgba(251,146,60,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href="/register" className="font-semibold text-slate-900 underline underline-offset-2">
              Create one for free
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Made for teachers. Powered by AI.
        </p>
      </div>
    </div>
  );
}

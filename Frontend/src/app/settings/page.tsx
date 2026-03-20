"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/use-auth-store";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setSchool(user.school || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    try {
      await updateProfile(name, school);
      setSuccessMsg("Profile updated successfully!");
    } catch {
      // error is handled in store
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Settings</h1>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email address cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Organization / School</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900 transition"
                placeholder="VedaAI Academy"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {successMsg && <p className="text-sm text-green-600 font-medium">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

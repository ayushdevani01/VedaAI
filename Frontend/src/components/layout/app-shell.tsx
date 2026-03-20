"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bell, BookOpen, Folder, Grid2X2, Library, LogOut, Menu, Plus, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { isLoggedIn } from "@/lib/token";

const navItems = [
  { href: "/", label: "Home", icon: Grid2X2 },
  { href: "/assignments", label: "Assignments", icon: Folder },
  { href: "/create", label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: "/library", label: "My Library", icon: Library },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    hydrate();
  }, [hydrate, router]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f8f6,_#ecebe7_60%,_#e5e3df)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-3 sm:p-4 lg:p-6">
        <aside className="hidden w-[260px] shrink-0 flex-col rounded-[30px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-700 text-lg font-black text-white shadow-lg shadow-orange-200">
              V
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">VedaAI</p>
              <p className="text-xs text-slate-500">Assessment studio</p>
            </div>
          </div>

          <Link
            href="/create"
            className="mb-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_0_2px_rgba(251,146,60,0.65),0_18px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </Link>

          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
                    active && "bg-slate-100 text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 transition hover:text-slate-900">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="rounded-3xl bg-slate-100 p-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-200 text-base font-bold text-amber-800">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{user?.name || "Loading…"}</p>
                  <p className="truncate text-sm text-slate-500">{user?.school || user?.email || ""}</p>
                </div>
                <button onClick={() => { logout(); router.replace("/login"); }} title="Sign out" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-red-500 transition active:scale-95">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="sticky top-3 z-20 rounded-[26px] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:top-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="lg:hidden flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-700 text-sm font-black text-white">V</div>
                  <span className="text-xl font-bold">VedaAI</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm text-slate-400">Teacher workspace</p>
                  <h1 className="text-lg font-semibold text-slate-900">AI Assessment Creator</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-2 py-2 sm:px-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-200 text-sm font-bold text-amber-800">
                    {initials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold">{user?.name?.split(" ")[0] || "Teacher"}</p>
                    <p className="text-xs text-slate-500">{user?.role || "Teacher"}</p>
                  </div>
                  <button 
                    onClick={() => { logout(); router.replace("/login"); }} 
                    title="Sign out" 
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-red-500 transition lg:hidden active:scale-95"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="pb-24 lg:pb-6">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 rounded-[24px] border border-white/70 bg-slate-950 px-3 py-2 text-white shadow-2xl lg:hidden">
        <div className="grid grid-cols-4 items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-slate-400", active && "text-white")}>
                <Icon className="h-4 w-4" />
                <span>{label.replace("AI Teacher's Toolkit", "AI Toolkit")}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

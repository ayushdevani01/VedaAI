import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6", className)}>{children}</div>;
}

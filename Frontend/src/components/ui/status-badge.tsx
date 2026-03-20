import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-700",
  generating: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  pending: "bg-sky-100 text-sky-700",
  queued: "bg-sky-100 text-sky-700",
  failed: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", styles[status] ?? "bg-slate-100 text-slate-700")}>
      {status}
    </span>
  );
}


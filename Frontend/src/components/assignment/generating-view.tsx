"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LoaderCircle, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { useAppStore } from "@/store/use-app-store";

const progressByStatus: Record<string, number> = {
  idle: 0,
  pending: 10,
  processing: 55,
  ready: 100,
  failed: 0,
};

const messageByStatus: Record<string, string> = {
  idle: "Waiting to start…",
  pending: "Job queued. Waiting for worker…",
  processing: "Building structured sections, balancing difficulty, and preparing your paper…",
  ready: "Paper ready! Redirecting…",
  failed: "Generation failed. Please go back and try again.",
};

export function GeneratingView({ assignmentId }: { assignmentId: string }) {
  const { wsStatus, generationStatus } = useSocket(assignmentId, true);
  const generationError = useAppStore((state) => state.generationError);
  const setGenerationStatus = useAppStore((state) => state.setGenerationStatus);

  useEffect(() => {
    setGenerationStatus("processing");
  }, [setGenerationStatus]);

  const progress = progressByStatus[generationStatus] ?? 0;
  const message = generationError || messageByStatus[generationStatus] || "Processing…";
  const isFailed = generationStatus === "failed";

  return (
    <Card className="flex min-h-[72vh] flex-col items-center justify-center bg-[#f4f3f0] text-center">
      <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-inner">
        {isFailed ? (
          <AlertCircle className="h-20 w-20 text-red-400" />
        ) : (
          <LoaderCircle className={`h-20 w-20 text-rose-400 ${generationStatus !== "ready" ? "animate-spin" : ""}`} />
        )}
      </div>

      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
          {isFailed ? "Generation failed" : "Generating assignment"}
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">
          {isFailed ? "Something went wrong" : "Your paper is being prepared"}
        </h2>
        <p className="text-lg text-slate-500">
          {isFailed
            ? message
            : "We're building structured sections, balancing difficulty, and preparing answer keys in real time."}
        </p>
      </div>

      {!isFailed && (
        <div className="mt-8 w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-4 rounded-full bg-slate-100">
            <div
              className="h-4 rounded-full bg-[linear-gradient(90deg,#111827,#f97316)] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">{message}</p>
          <div className="mt-5 flex items-center justify-between rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              {wsStatus === "disconnected" || wsStatus === "error" ? (
                <WifiOff className="h-4 w-4 text-rose-500" />
              ) : (
                <Wifi className="h-4 w-4 text-emerald-500" />
              )}
              <span>Realtime status: {wsStatus}</span>
            </div>
            <span>{generationStatus}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/assignments" className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
          Back to assignments
        </Link>
        {isFailed && (
          <Link href="/create" className="rounded-full bg-rose-600 px-5 py-3 font-semibold text-white">
            Try again
          </Link>
        )}
        {!isFailed && (
          <Link href={`/paper/${assignmentId}`} className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Skip to preview
          </Link>
        )}
      </div>
    </Card>
  );
}

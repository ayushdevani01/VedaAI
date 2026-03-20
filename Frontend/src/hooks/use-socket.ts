"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/store/use-app-store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

export function useSocket(assignmentId: string, redirectOnReady = false, onUpdated?: () => void) {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const setWsStatus = useAppStore((state) => state.setWsStatus);
  const setGenerationStatus = useAppStore((state) => state.setGenerationStatus);
  const setGenerationError = useAppStore((state) => state.setGenerationError);
  const wsStatus = useAppStore((state) => state.wsStatus);
  const generationStatus = useAppStore((state) => state.generationStatus);

  useEffect(() => {
    if (!assignmentId) return;

    setWsStatus("connecting");

    const socket = io(WS_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setWsStatus("connected");
      socket.emit("join-assignment", assignmentId);
    });

    socket.on("disconnect", () => setWsStatus("disconnected"));
    socket.on("connect_error", () => setWsStatus("error"));

    socket.on("job:processing", () => {
      setGenerationStatus("processing");
    });

    socket.on("paper:ready", () => {
      setGenerationStatus("ready");
      if (redirectOnReady) {
        setTimeout(() => router.push(`/paper/${assignmentId}`), 600);
      }
    });

    socket.on("paper:updated", () => {
      setGenerationStatus("ready");
      if (onUpdated) onUpdated();
    });

    socket.on("job:failed", (data: { error?: string }) => {
      setGenerationStatus("failed");
      setGenerationError(data?.error || "Generation failed. Please try again.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setWsStatus("idle");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  return { wsStatus, generationStatus };
}

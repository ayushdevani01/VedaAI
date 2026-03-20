"use client";

import { useRef, useState } from "react";
import { assignmentApi } from "@/lib/api";

export function useVoiceInput(onParsed: (patch: Record<string, string>) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setError(null);
    setTranscript("");
    setPendingTranscript(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto trigger parsing without requiring user click
      setTranscript((current) => {
        const finalTranscript = current.trim();
        if (finalTranscript) {
          setIsParsing(true);
          assignmentApi.parseVoice(finalTranscript)
            .then(parsed => onParsed(parsed))
            .catch(() => setError("Failed to parse voice input."))
            .finally(() => {
              setIsParsing(false);
              setTranscript("");
              setPendingTranscript(null);
            });
        }
        return current;
      });
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      let errMsg = `Voice error: ${event.error}`;
      if (event.error === 'network') {
        errMsg = "Voice network error: Chrome's speech servers are unreachable. Try disabling VPNs, check your internet, or ensure you are on a secure (HTTPS/localhost) context.";
      }
      setError(errMsg);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const confirmTranscript = async () => {
    if (!pendingTranscript) return;
    setIsParsing(true);
    try {
      const parsed = await assignmentApi.parseVoice(pendingTranscript);
      onParsed(parsed);
      setPendingTranscript(null);
      setTranscript("");
    } catch {
      setError("Failed to parse voice input. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const cancelTranscript = () => {
    setPendingTranscript(null);
    setTranscript("");
  };

  return {
    isListening,
    transcript,
    pendingTranscript,
    error,
    isParsing,
    startListening,
    stopListening,
    confirmTranscript,
    cancelTranscript,
  };
}

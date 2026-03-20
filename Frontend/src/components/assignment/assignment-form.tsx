"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mic, MicOff, Plus, Sparkles, Trash2, UploadCloud, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRef, useState } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { calcTotals, createDefaultFormValues } from "@/lib/mock-data";
import { AssignmentFormValues, QuestionType } from "@/lib/types";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useAppStore } from "@/store/use-app-store";

const questionTypes: [QuestionType, ...QuestionType[]] = ["MCQ", "Short Answer", "Long Answer", "True/False", "Case Study", "Diagram Based"];

const schema = z.object({
  title: z.string().min(3),
  subject: z.string().min(2),
  grade: z.string().optional(),
  topic: z.string().optional(),
  chapter: z.string().optional(),
  dueDate: z.string().min(1),
  instructions: z.string().min(10),
  durationMinutes: z.number().min(15).max(180),
  bloomLevel: z.string().optional(),
  includeAnswerKey: z.boolean(),
  includeRubric: z.boolean(),
  fileName: z.string().optional(),
  questionTypes: z.array(
    z.object({
      id: z.string(),
      type: z.enum(questionTypes),
      count: z.number().min(1).max(20),
      marksPerQuestion: z.number().min(1).max(20),
    }),
  ).min(1),
});

type FormValues = z.infer<typeof schema>;

export function AssignmentForm() {
  const router = useRouter();
  const submitAssignment = useAppStore((state) => state.submitAssignment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultFormValues(),
  });

  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "questionTypes" });
  const watched = useWatch({ control: form.control });
  const totals = calcTotals(watched as AssignmentFormValues);

  const {
    isListening,
    transcript,
    pendingTranscript,
    error: voiceError,
    isParsing,
    startListening,
    stopListening,
    confirmTranscript,
    cancelTranscript,
  } = useVoiceInput((patch) => {
    for (const [key, value] of Object.entries(patch)) {
      if (key === "questionTypes" && Array.isArray(value)) {
        const withIds = value.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
        replace(withIds as any);
      } else if (value) {
        form.setValue(key as keyof FormValues, value as never, { shouldDirty: true });
      }
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const assignmentId = await submitAssignment(values as AssignmentFormValues, selectedFile ?? undefined);
      router.push(`/generating/${assignmentId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create assignment");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.45fr_0.7fr]">
      <Card className="bg-[#f6f5f1]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Create Assignment</p>
            <h2 className="text-3xl font-bold">Assignment Details</h2>
            <p className="mt-2 text-sm text-slate-500">Basic information, paper structure, and optional file context for the AI generator.</p>
          </div>
          <button
            onClick={isListening ? stopListening : startListening}
            type="button"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isListening
                ? "border-red-200 bg-red-50 text-red-700 animate-pulse"
                : "border-orange-200 bg-orange-50 text-orange-700"
              }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? "Stop Listening" : "Voice Fill"}
          </button>
        </div>

        {/* Live voice transcript display */}
        {(isListening || pendingTranscript) && (
          <div className="mb-4 rounded-[24px] border border-orange-200 bg-orange-50 p-4">
            {isListening && transcript && (
              <p className="text-sm text-slate-700 italic">
                <span className="font-semibold text-orange-700">Listening: </span>{transcript}
              </p>
            )}
            {!isListening && isParsing && (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                Parsing your request with AI and filling out the form...
              </div>
            )}
          </div>
        )}

        {voiceError && (
          <div className="mb-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">{voiceError}</div>
        )}
        {submitError && (
          <div className="mb-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-semibold">Source Material</h3>
                <p className="text-sm text-slate-500">Upload a PDF or text file for AI context (optional).</p>
              </div>
            </div>
            <label
              className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
            >
              <UploadCloud className="mb-4 h-10 w-10 text-slate-400" />
              {selectedFile ? (
                <p className="font-semibold text-slate-700">{selectedFile.name}</p>
              ) : (
                <>
                  <p className="font-semibold text-slate-700">Choose a file or drag & drop it here</p>
                  <p className="mt-1 text-sm text-slate-400">PDF or TXT up to 10MB</p>
                </>
              )}
              <span className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Browse Files</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="sr-only"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {([
              ["title", "Assignment Title", "Quiz on Electricity"],
              ["subject", "Subject", "Science"],
              ["grade", "Grade (optional)", "Grade 8"],
              ["topic", "Topic (optional)", "Electric circuits"],
              ["chapter", "Chapter (optional)", "Chapter 6"],
              ["dueDate", "Due Date", ""],
            ] as [string, string, string][]).map(([name, label, placeholder]) => (
              <label key={name} className="space-y-2 text-sm font-medium text-slate-700">
                <span>{label}</span>
                <input
                  type={name === "dueDate" ? "date" : "text"}
                  placeholder={placeholder}
                  {...form.register(name as keyof FormValues)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-slate-900"
                />
                {form.formState.errors[name as keyof FormValues] && (
                  <p className="text-xs text-red-500">{String(form.formState.errors[name as keyof FormValues]?.message)}</p>
                )}
              </label>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Duration (minutes)</span>
              <input type="number" {...form.register("durationMinutes", { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Bloom Level (optional)</span>
              <input type="text" {...form.register("bloomLevel")} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900" />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Instructions</span>
            <textarea {...form.register("instructions")} rows={4} className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900" />
          </label>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Question Mix</h3>
                <p className="text-sm text-slate-500">Configure types, counts, and marks for each section.</p>
              </div>
              <button
                type="button"
                onClick={() => append({ id: crypto.randomUUID(), type: "MCQ", count: 2, marksPerQuestion: 1 })}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-[24px] bg-slate-50 p-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_auto]">
                  <select {...form.register(`questionTypes.${index}.type`)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none">
                    {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input type="number" {...form.register(`questionTypes.${index}.count`, { valueAsNumber: true })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" placeholder="Count" />
                  <input type="number" {...form.register(`questionTypes.${index}.marksPerQuestion`, { valueAsNumber: true })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" placeholder="Marks" />
                  <button type="button" onClick={() => remove(index)} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 text-slate-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-700">
              <input type="checkbox" {...form.register("includeAnswerKey")} className="h-4 w-4" /> Include answer key
            </label>
            <label className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-700">
              <input type="checkbox" {...form.register("includeRubric")} className="h-4 w-4" /> Include rubric
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] bg-slate-950 px-5 py-4 text-white">
            <div>
              <p className="text-sm text-slate-400">Ready to generate</p>
              <p className="text-lg font-semibold">Create a structured assessment in one go</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_0_2px_rgba(251,146,60,0.5)] disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isSubmitting ? "Creating…" : "Generate Assignment"}
            </button>
          </div>
        </form>
      </Card>

      <div className="space-y-5">
        <Card>
          <p className="text-sm text-slate-400">Summary</p>
          <h3 className="mt-1 text-2xl font-bold">Live paper summary</h3>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-[24px] bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Total questions</p>
              <p className="mt-2 text-3xl font-bold">{totals.totalQuestions}</p>
            </div>
            <div className="rounded-[24px] bg-orange-50 p-4">
              <p className="text-sm text-orange-600">Total marks</p>
              <p className="mt-2 text-3xl font-bold text-orange-700">{totals.totalMarks}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[linear-gradient(135deg,#111827,#1f2937)] text-white">
          <p className="text-sm text-slate-300">Bonus features</p>
          <h3 className="mt-1 text-2xl font-bold">Built for better UX</h3>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Voice fill", "Per-section regenerate", "Answer key", "Real-time socket", "Print mode", "AI"].map((item) => (
              <span key={item} className="rounded-full bg-white/10 px-3 py-2">{item}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

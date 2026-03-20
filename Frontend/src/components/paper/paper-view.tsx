"use client";

import { Download, Printer, RefreshCcw, Sparkles, Loader2, AlertCircle, Pencil, X, FileText, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { useAppStore } from "@/store/use-app-store";
import { paperApi, PaperResponse } from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import { downloadPaperAsPDF } from "@/lib/generate-paper-html";

const suggestions = [
  "Make Section B more application-based",
  "Reduce repetition across MCQs",
  "Increase difficulty for top performers",
];

export function PaperView({ assignmentId }: { assignmentId: string }) {
  const paper = useAppStore((state) => state.paper);
  const fetchPaper = useAppStore((state) => state.fetchPaper);
  const setPaper = useAppStore((state) => state.setPaper);
  const paperLoading = useAppStore((state) => state.paperLoading);
  const paperError = useAppStore((state) => state.paperError);
  const processingMessage = useAppStore((state) => state.processingMessage);
  const setProcessingMessage = useAppStore((state) => state.setProcessingMessage);

  const [refinePrompt, setRefinePrompt] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [refining, setRefining] = useState(false);
  const [showTeacherCopy, setShowTeacherCopy] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<{ sIndex: number; qIndex: number } | null>(null);
  const [questionRefinePrompt, setQuestionRefinePrompt] = useState("");

  useSocket(assignmentId, false, () => {
    fetchPaper(assignmentId);
    setProcessingMessage(null);
    setActiveSection(null);
    setActiveQuestion(null);
  });

  useEffect(() => {
    fetchPaper(assignmentId);
  }, [assignmentId, fetchPaper]);

  const handleRefine = async (prompt: string) => {
    if (!prompt.trim()) return;
    setRefining(true);
    setProcessingMessage(`Applying refinement: ${prompt}`);
    try {
      await paperApi.refine(assignmentId, prompt);
      setRefinePrompt("");
      // Socket 'paper:updated' will trigger refetch
    } catch {
      setProcessingMessage("Refinement failed. Please try again.");
      setTimeout(() => setProcessingMessage(null), 3000);
    } finally {
      setRefining(false);
    }
  };

  const handleRegenerateSection = async (sectionIndex: number) => {
    setActiveSection(String(sectionIndex));
    setProcessingMessage("Regenerating section with fresh question patterns…");
    try {
      await paperApi.regenerateSection(assignmentId, sectionIndex);
      // Socket 'paper:updated' will trigger refetch
    } catch {
      setProcessingMessage("Section regeneration failed.");
      setTimeout(() => setProcessingMessage(null), 3000);
      setActiveSection(null);
    }
  };

  const handleRegenerateQuestion = async (sectionIndex: number, questionIndex: number, prompt: string) => {
    setActiveQuestion({ sIndex: sectionIndex, qIndex: questionIndex });
    setProcessingMessage("Regenerating individual question...");
    try {
      await paperApi.regenerateQuestion(assignmentId, sectionIndex, questionIndex, prompt);
      setQuestionRefinePrompt("");
      // Socket 'paper:updated' will trigger refetch
    } catch {
      setProcessingMessage("Question regeneration failed.");
      setTimeout(() => setProcessingMessage(null), 3000);
      setActiveQuestion(null);
    }
  };

  if (paperLoading) {
    return (
      <Card className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f4f3f0]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-400" />
        <p className="mt-4 text-slate-500">Loading generated paper…</p>
      </Card>
    );
  }

  if (paperError || !paper) {
    return (
      <Card className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f4f3f0] text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600">{paperError || "Paper not found"}</p>
        <button onClick={() => fetchPaper(assignmentId)} className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Retry
        </button>
      </Card>
    );
  }

  // Infer title/subject from assignmentId since PaperResponse doesn't include them
  const typedPaper = paper as PaperResponse & { title?: string; subject?: string; grade?: string; topic?: string; chapter?: string };

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 15mm; }
          body { background: white !important; color: black !important; }
          .Card, .rounded-\\[24px\\], .rounded-[24px], .rounded-2xl {
            border-radius: 0 !important;
            box-shadow: none !important;
            border-color: #e2e8f0 !important;
            background: transparent !important;
          }
          nav, header, aside, .print\\:hidden { display: none !important; }
        }
      `}</style>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.58fr] print:block print:bg-white print:text-black">
        <div className="space-y-5 print:space-y-6">
        {processingMessage && (
          <Card className="border-amber-200 bg-amber-50 text-amber-800 print:hidden">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              {processingMessage}
            </div>
          </Card>
        )}

        <Card className="print:shadow-none">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">Generated paper</p>
              <h2 className="text-3xl font-bold">{typedPaper.title || "Question Paper"}</h2>
              <p className="mt-2 text-slate-500">
                {typedPaper.subject || "Assessment"} · {paper.sections.length} section{paper.sections.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-slate-400">Marks</p><p className="font-semibold">{paper.totalMarks}</p></div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-slate-400">Generated</p><p className="font-semibold">{new Date(paper.generatedAt).toLocaleDateString()}</p></div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-slate-400">Sections</p><p className="font-semibold">{paper.sections.length}</p></div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
             <div className="flex gap-2 print:hidden">
               <button onClick={() => setShowTeacherCopy(false)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!showTeacherCopy ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>Student Copy</button>
               <button onClick={() => setShowTeacherCopy(true)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showTeacherCopy ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"}`}>Teacher Copy</button>
             </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {typedPaper.grade && <p><span className="text-slate-500">Grade:</span> <span className="font-semibold">{typedPaper.grade}</span></p>}
            {typedPaper.chapter && <p><span className="text-slate-500">Chapter:</span> <span className="font-semibold">{typedPaper.chapter}</span></p>}
            {typedPaper.topic && <p><span className="text-slate-500">Topic:</span> <span className="font-semibold">{typedPaper.topic}</span></p>}
          </div>

          <div className="mt-6 grid gap-4 rounded-[24px] bg-slate-50 p-4 sm:grid-cols-3 print:grid-cols-3">
            {[["Student Name", "____________________"], ["Class / Section", "____________________"], ["Roll Number", "____________________"]].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white px-4 py-4 print:border print:border-slate-200">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-3 text-sm text-slate-600">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {paper.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="print:break-inside-avoid">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold">{section.title}</h3>
                </div>
                <p className="mt-2 text-slate-500">{section.instruction}</p>
              </div>
              <button
                onClick={() => handleRegenerateSection(sectionIndex)}
                disabled={activeSection !== null}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 print:hidden disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${activeSection === String(sectionIndex) ? "animate-spin" : ""}`} />
                Regenerate section
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {section.questions.map((question, qIndex) => (
                <div key={qIndex} className="rounded-[24px] border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Q{qIndex + 1}. {question.text}</p>
                      {question.options?.length ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {question.options.map((option, optIdx) => (
                            <div key={optIdx} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                              {String.fromCharCode(65 + optIdx)}. {option}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Inline Regenerate Box */}
                      {activeQuestion?.sIndex === sectionIndex && activeQuestion?.qIndex === qIndex ? (
                        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4 print:hidden animate-fade-in-up">
                          <p className="text-sm font-semibold text-orange-800 mb-2">Regenerate Question {qIndex + 1}</p>
                          <textarea
                            value={questionRefinePrompt}
                            onChange={(e) => setQuestionRefinePrompt(e.target.value)}
                            rows={3}
                            placeholder="Optional: Directions for the AI (e.g. 'Make it harder' or 'Change topic to X')"
                            className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleRegenerateQuestion(sectionIndex, qIndex, questionRefinePrompt)}
                              disabled={processingMessage !== null}
                              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              <RefreshCcw className={`h-3 w-3 ${processingMessage ? "animate-spin" : ""}`} /> Generate
                            </button>
                            <button
                              onClick={() => { setActiveQuestion(null); setQuestionRefinePrompt(""); }}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-start gap-x-3 gap-y-2 sm:mt-0 sm:flex-col sm:items-end">
                      <DifficultyBadge difficulty={question.difficulty} />
                      <span className="whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">{question.marks} marks</span>

                      {!(activeQuestion?.sIndex === sectionIndex && activeQuestion?.qIndex === qIndex) && (
                        <button
                          onClick={() => setActiveQuestion({ sIndex: sectionIndex, qIndex })}
                          className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-orange-600 print:hidden transition"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit / Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                  {showTeacherCopy && question.answer && (
                    <div className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-900 print:bg-transparent print:border print:border-orange-200">
                      <span className="font-bold">Answer: </span>{question.answer.replace(/\*\*/g, '')}
                    </div>
                  )}
                  {showTeacherCopy && question.rubric && question.rubric.length > 0 && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-800 print:bg-transparent print:border print:border-slate-200">
                      <span className="font-bold">Rubric: </span>
                      <ul className="list-inside list-disc mt-1 text-slate-600">
                        {question.rubric.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-5 print:hidden">
        <Card>
          <p className="text-sm text-slate-400">Refine paper</p>
          <h3 className="mt-1 text-2xl font-bold">Prompt the AI editor</h3>
          <textarea
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            rows={5}
            placeholder="Ask for changes to tone, difficulty, or section balance…"
            className="mt-4 w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900"
          />
          <button
            onClick={() => handleRefine(refinePrompt)}
            disabled={refining || !refinePrompt.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Apply refinement
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => handleRefine(s)} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                {s}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">Actions</p>
          <h3 className="mt-1 text-2xl font-bold">Export and print</h3>
          <div className="mt-5 space-y-3">
            <button
              onClick={() =>
                downloadPaperAsPDF(
                  paper,
                  { title: typedPaper.title, subject: typedPaper.subject, grade: typedPaper.grade, topic: typedPaper.topic, chapter: typedPaper.chapter },
                  "student"
                )
              }
              className="flex w-full items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4 text-left font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-500" /> Student Copy (PDF)</span>
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                downloadPaperAsPDF(
                  paper,
                  { title: typedPaper.title, subject: typedPaper.subject, grade: typedPaper.grade, topic: typedPaper.topic, chapter: typedPaper.chapter },
                  "teacher"
                )
              }
              className="flex w-full items-center justify-between rounded-[22px] bg-orange-50 px-4 py-4 text-left font-semibold text-orange-700 hover:bg-orange-100 transition"
            >
              <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-orange-500" /> Teacher Copy (PDF)</span>
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => window.print()} className="flex w-full items-center justify-between rounded-[22px] bg-slate-950 px-4 py-4 text-left font-semibold text-white hover:bg-slate-800 transition">
              <span className="flex items-center gap-2"><Printer className="h-4 w-4" /> Print this page</span>
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}

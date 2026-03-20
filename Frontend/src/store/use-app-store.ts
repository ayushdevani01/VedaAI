"use client";

import { create } from "zustand";
import { assignmentApi, paperApi, AssignmentListItem, PaperResponse } from "@/lib/api";
import { AssignmentFormValues } from "@/lib/types";

interface AppState {
  assignments: AssignmentListItem[];
  assignmentsLoading: boolean;
  assignmentsError: string | null;

  paper: PaperResponse | null;
  paperLoading: boolean;
  paperError: string | null;

  currentAssignmentId: string | null;
  generationStatus: "idle" | "pending" | "processing" | "ready" | "failed";
  wsStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  generationError: string | null;
  processingMessage: string | null;

  fetchAssignments: () => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  submitAssignment: (values: AssignmentFormValues, file?: File) => Promise<string>;
  fetchPaper: (assignmentId: string) => Promise<void>;
  setPaper: (paper: PaperResponse) => void;
  setGenerationStatus: (status: AppState["generationStatus"]) => void;
  setWsStatus: (status: AppState["wsStatus"]) => void;
  setGenerationError: (error: string | null) => void;
  setProcessingMessage: (message: string | null) => void;
  setCurrentAssignmentId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  assignments: [],
  assignmentsLoading: false,
  assignmentsError: null,

  paper: null,
  paperLoading: false,
  paperError: null,

  currentAssignmentId: null,
  generationStatus: "idle",
  wsStatus: "idle",
  generationError: null,
  processingMessage: null,

  fetchAssignments: async () => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      const data = await assignmentApi.list();
      set({ assignments: data, assignmentsLoading: false });
    } catch (err) {
      set({
        assignmentsError: err instanceof Error ? err.message : "Failed to load assignments",
        assignmentsLoading: false,
      });
    }
  },

  deleteAssignment: async (id: string) => {
    await assignmentApi.delete(id);
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    }));
  },

  submitAssignment: async (values: AssignmentFormValues, file?: File) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("subject", values.subject);
    formData.append("dueDate", values.dueDate);
    formData.append(
      "questionTypeConfigs",
      JSON.stringify(
        values.questionTypes.map((row) => ({
          // Map frontend types to backend enum values (remove spaces/slashes)
          type: row.type === "True/False" ? "TrueFalse"
              : row.type === "Short Answer" ? "ShortAnswer"
              : row.type === "Long Answer" ? "LongAnswer"
              : row.type === "Case Study" ? "LongAnswer"
              : row.type === "Diagram Based" ? "LongAnswer"
              : row.type,
          numQuestions: row.count,
          marksPerQuestion: row.marksPerQuestion,
        }))
      )
    );
    if (values.instructions) formData.append("additionalInstructions", values.instructions);
    if (values.grade) formData.append("grade", values.grade);
    if (values.topic) formData.append("topic", values.topic);
    if (values.chapter) formData.append("chapter", values.chapter);
    if (values.durationMinutes) formData.append("durationMinutes", String(values.durationMinutes));
    if (values.bloomLevel) formData.append("bloomLevel", values.bloomLevel);
    formData.append("includeAnswerKey", String(values.includeAnswerKey));
    formData.append("includeRubric", String(values.includeRubric));
    if (file) formData.append("file", file);

    const result = await assignmentApi.create(formData);
    set({ currentAssignmentId: result.assignmentId, generationStatus: "processing" });
    return result.assignmentId;
  },

  fetchPaper: async (assignmentId: string) => {
    set({ paperLoading: true, paperError: null });
    try {
      const paper = await paperApi.get(assignmentId);
      set({ paper, paperLoading: false });
    } catch (err) {
      set({
        paperError: err instanceof Error ? err.message : "Failed to load paper",
        paperLoading: false,
      });
    }
  },

  setPaper: (paper: PaperResponse) => set({ paper }),
  setGenerationStatus: (status) => set({ generationStatus: status }),
  setWsStatus: (status) => set({ wsStatus: status }),
  setGenerationError: (error) => set({ generationError: error }),
  setProcessingMessage: (message) => set({ processingMessage: message }),
  setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),
}));

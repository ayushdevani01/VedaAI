import { getToken } from "@/lib/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json() as { success: boolean; data?: T; error?: string };

  if (!res.ok || !json.success) {
    // 401 → redirect to login
    if (res.status === 401 && typeof window !== "undefined" && !path.includes("/auth/")) {
      window.location.href = "/login";
    }
    throw new Error(json.error || `Request failed: ${res.status}`);
  }

  return json.data as T;
}


// ---------- Types ----------
export interface AssignmentListItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
  totalMarks: number;
  totalQuestions: number;
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  jobId: string;
  status: string;
}

export interface PaperResponse {
  assignmentId: string;
  sections: Array<{
    title: string;
    instruction: string;
    questions: Array<{
      text: string;
      type: string;
      difficulty: "easy" | "medium" | "hard";
      marks: number;
      options?: string[];
      answer?: string;
      rubric?: string[];
    }>;
  }>;
  totalMarks: number;
  generatedAt: string;
}

// ---------- Assignment API ----------
export const assignmentApi = {
  create(formData: FormData): Promise<CreateAssignmentResponse> {
    return request<CreateAssignmentResponse>("/api/assignments", {
      method: "POST",
      body: formData,
    });
  },

  list(): Promise<AssignmentListItem[]> {
    return request<AssignmentListItem[]>("/api/assignments");
  },

  getOne(id: string): Promise<AssignmentListItem> {
    return request<AssignmentListItem>(`/api/assignments/${id}`);
  },

  delete(id: string): Promise<void> {
    return request<void>(`/api/assignments/${id}`, { method: "DELETE" });
  },

  parseVoice(transcript: string): Promise<Record<string, string>> {
    return request<Record<string, string>>("/api/assignments/parse-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
  },
};

// ---------- Paper API ----------
export const paperApi = {
  get(assignmentId: string): Promise<PaperResponse> {
    return request<PaperResponse>(`/api/papers/${assignmentId}`);
  },

  refine(assignmentId: string, instruction: string): Promise<{ jobId: string }> {
    return request<{ jobId: string }>(`/api/papers/${assignmentId}/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction }),
    });
  },

  regenerate(assignmentId: string): Promise<{ jobId: string }> {
    return request<{ jobId: string }>(`/api/papers/${assignmentId}/regenerate`, {
      method: "POST",
    });
  },

  regenerateSection(assignmentId: string, sectionIndex: number): Promise<{ jobId: string }> {
    return request<{ jobId: string }>(`/api/papers/${assignmentId}/regenerate-section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionIndex }),
    });
  },

  regenerateQuestion(assignmentId: string, sectionIndex: number, questionIndex: number, instruction?: string): Promise<{ jobId: string }> {
    return request<{ jobId: string }>(`/api/papers/${assignmentId}/regenerate-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionIndex, questionIndex, instruction }),
    });
  },
};

export type Difficulty = "easy" | "medium" | "hard";
export type AssignmentStatus = "draft" | "queued" | "generating" | "ready" | "failed";

export type QuestionType =
  | "MCQ"
  | "Short Answer"
  | "Long Answer"
  | "True/False"
  | "Case Study"
  | "Diagram Based";

export interface QuestionTypeRow {
  id: string;
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentFormValues {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  chapter: string;
  dueDate: string;
  instructions: string;
  durationMinutes: number;
  bloomLevel: string;
  includeAnswerKey: boolean;
  includeRubric: boolean;
  fileName?: string;
  questionTypes: QuestionTypeRow[];
}

export interface AssignmentSummary {
  id: string;
  title: string;
  subject: string;
  status: AssignmentStatus;
  assignedOn: string;
  dueDate: string;
  totalMarks: number;
  totalQuestions: number;
}

export interface PaperQuestion {
  id: string;
  text: string;
  marks: number;
  difficulty: Difficulty;
  options?: string[];
  answer?: string;
  rubric?: string[];
}

export interface PaperSection {
  id: string;
  title: string;
  instructions: string;
  marks: number;
  questions: PaperQuestion[];
}

export interface PaperData {
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  chapter: string;
  durationMinutes: number;
  totalMarks: number;
  generatedAt: string;
  sections: PaperSection[];
  answerKey?: Array<{ questionId: string; answer: string }>;
  rubric?: Array<{ sectionId: string; criteria: string[] }>;
}

export interface GenerationState {
  assignmentId: string;
  status: AssignmentStatus;
  socketStatus: "connected" | "connecting" | "polling" | "offline";
  progress: number;
  message: string;
}

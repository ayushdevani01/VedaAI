import { AssignmentFormValues, AssignmentSummary, GenerationState, PaperData, PaperSection, QuestionType } from "@/lib/types";

const questionTypeDefaults: QuestionType[] = ["MCQ", "Short Answer", "Long Answer"];

export const createDefaultFormValues = (): AssignmentFormValues => ({
  title: "Quiz on Electricity",
  subject: "Science",
  grade: "Grade 8",
  topic: "Electricity and Circuits",
  chapter: "Chapter 6",
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
  instructions: "Balance foundational recall with application-based questions.",
  durationMinutes: 45,
  bloomLevel: "Understand + Apply",
  includeAnswerKey: true,
  includeRubric: true,
  fileName: "electricity-reference.png",
  questionTypes: questionTypeDefaults.map((type, index) => ({
    id: `${type}-${index}`,
    type,
    count: index === 0 ? 4 : 2,
    marksPerQuestion: index === 2 ? 5 : 2,
  })),
});

export const calcTotals = (values: AssignmentFormValues) => {
  const totalQuestions = values.questionTypes.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = values.questionTypes.reduce((sum, row) => sum + row.count * row.marksPerQuestion, 0);
  return { totalQuestions, totalMarks };
};

export const mockAssignments: AssignmentSummary[] = [
  {
    id: "a1",
    title: "Quiz on Electricity",
    subject: "Science",
    status: "ready",
    assignedOn: "2026-03-15",
    dueDate: "2026-03-21",
    totalMarks: 24,
    totalQuestions: 8,
  },
  {
    id: "a2",
    title: "Fractions Revision Sheet",
    subject: "Mathematics",
    status: "generating",
    assignedOn: "2026-03-17",
    dueDate: "2026-03-23",
    totalMarks: 20,
    totalQuestions: 10,
  },
  {
    id: "a3",
    title: "Ancient India Source Analysis",
    subject: "History",
    status: "failed",
    assignedOn: "2026-03-18",
    dueDate: "2026-03-26",
    totalMarks: 30,
    totalQuestions: 7,
  },
];

const electricitySections: PaperSection[] = [
  {
    id: "s1",
    title: "Section A - Objective",
    instructions: "Choose the correct option for each question.",
    marks: 8,
    questions: [
      {
        id: "q1",
        text: "Which material is commonly used as an insulator in household wiring?",
        marks: 2,
        difficulty: "easy",
        options: ["Copper", "Rubber", "Aluminium", "Iron"],
        answer: "Rubber",
      },
      {
        id: "q2",
        text: "A closed path through which electric current flows is called a ____. ",
        marks: 2,
        difficulty: "easy",
        options: ["cell", "circuit", "terminal", "switch"],
        answer: "circuit",
      },
      {
        id: "q3",
        text: "Which device is used to measure electric current?",
        marks: 2,
        difficulty: "medium",
        options: ["Voltmeter", "Ammeter", "Galvanometer", "Resistor"],
        answer: "Ammeter",
      },
      {
        id: "q4",
        text: "In a series circuit, if one bulb fuses, the other bulbs ____. ",
        marks: 2,
        difficulty: "medium",
        options: ["glow brighter", "continue glowing", "stop glowing", "become dim temporarily"],
        answer: "stop glowing",
      },
    ],
  },
  {
    id: "s2",
    title: "Section B - Short Answer",
    instructions: "Answer in 2-3 sentences. Show reasoning where relevant.",
    marks: 6,
    questions: [
      {
        id: "q5",
        text: "Differentiate between conductors and insulators with one example each.",
        marks: 3,
        difficulty: "medium",
        answer: "Conductors allow electric current to pass easily, such as copper. Insulators resist current flow, such as rubber.",
        rubric: ["Defines conductors correctly", "Defines insulators correctly", "Gives one valid example each"],
      },
      {
        id: "q6",
        text: "Why is a switch important in an electric circuit?",
        marks: 3,
        difficulty: "easy",
        answer: "A switch opens or closes the circuit, allowing us to control the flow of current safely.",
        rubric: ["Mentions control of current", "Explains opening/closing circuit"],
      },
    ],
  },
  {
    id: "s3",
    title: "Section C - Application",
    instructions: "Read carefully and answer in detail.",
    marks: 10,
    questions: [
      {
        id: "q7",
        text: "Riya notices that one bulb in her decorative lights has fused and the entire set stops working. Explain what type of circuit is likely used and why.",
        marks: 5,
        difficulty: "hard",
        answer: "The lights are likely connected in a series circuit. In a series circuit, all components share one path, so if one bulb fuses, the path breaks and current stops for the entire circuit.",
        rubric: ["Identifies series circuit", "Explains single-path current flow", "Links fuse to open circuit"],
      },
      {
        id: "q8",
        text: "Draw and label a simple circuit containing a cell, switch, bulb, and connecting wires. State what happens when the switch is open.",
        marks: 5,
        difficulty: "hard",
        answer: "A correct simple circuit diagram should show all four components in a closed loop. When the switch is open, the circuit is incomplete and the bulb does not glow.",
        rubric: ["Includes all components", "Correct labeling", "Explains open switch effect"],
      },
    ],
  },
];

export const mockPaper = (assignmentId: string): PaperData => ({
  assignmentId,
  title: "Quiz on Electricity",
  subject: "Science",
  grade: "Grade 8",
  chapter: "Chapter 6",
  durationMinutes: 45,
  totalMarks: 24,
  generatedAt: "2026-03-19T22:00:00.000Z",
  sections: electricitySections,
  answerKey: electricitySections.flatMap((section) =>
    section.questions
      .filter((question) => question.answer)
      .map((question) => ({ questionId: question.id, answer: question.answer ?? "" })),
  ),
  rubric: electricitySections
    .filter((section) => section.questions.some((question) => question.rubric?.length))
    .map((section) => ({
      sectionId: section.id,
      criteria: section.questions.flatMap((question) => question.rubric ?? []),
    })),
});

export const mockGenerationState = (assignmentId: string): GenerationState => ({
  assignmentId,
  status: "generating",
  socketStatus: "connecting",
  progress: 64,
  message: "Structuring sections and balancing difficulty across the paper.",
});

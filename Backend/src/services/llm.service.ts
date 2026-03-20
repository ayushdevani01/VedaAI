import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { GeneratedPaper, GeneratedPaperSchema, GeneratedSection, GeneratedSectionSchema, QuestionSchema, Question } from "./paper-schema";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
}

function extractJson(raw: string): string {
  // Strip markdown code fences if Gemini returns them despite responseMimeType
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return raw.trim();
}

export async function generatePaper(prompt: string): Promise<GeneratedPaper> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  const validation = GeneratedPaperSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(
      `Gemini output failed schema validation: ${validation.error.message}`
    );
  }

  return validation.data;
}

export async function generateSection(prompt: string): Promise<GeneratedSection> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`Gemini returned non-JSON response for section: ${raw.slice(0, 200)}`);
  }

  const validation = GeneratedSectionSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(`Gemini section output failed validation: ${validation.error.message}`);
  }
  return validation.data;
}

export async function generateQuestion(prompt: string): Promise<Question> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`Gemini returned non-JSON response for question: ${raw.slice(0, 200)}`);
  }

  const validation = QuestionSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(`Gemini question output failed validation: ${validation.error.message}`);
  }
  return validation.data;
}

export async function parseVoiceTranscript(transcript: string): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  });

  const prompt = `Extract assignment details from the following voice transcript and return a JSON object.
Return ONLY JSON with exactly these keys:
- title (string)
- subject (string)
- grade (string)
- topic (string)
- chapter (string)
- instructions (string)
- questionTypes (array of objects with keys: "type" (must be one of: "MCQ", "ShortAnswer", "LongAnswer", "TrueFalse", "FillInBlanks"), "count" (number between 1-50), "marksPerQuestion" (number between 1-20)).

CRITICAL MATH RULE: If the transcript explicitly asks for a target total exam marks (e.g., "a 50 mark test"), you MUST generate a 'questionTypes' array where the sum of (count * marksPerQuestion) across all types exactly equals that target total! If they don't specify the exact breakdown, invent a balanced mix of MCQ (1 mark), ShortAnswer (2 or 3 marks), and LongAnswer (4 or 5 marks) that mathematically equates precisely to the target total.

For string properties, use an empty string if not mentioned.

Transcript: "${transcript}"`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  try {
    return JSON.parse(extractJson(raw)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

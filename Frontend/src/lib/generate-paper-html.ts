import type { PaperResponse } from "@/lib/api";

interface PaperMeta {
  title?: string;
  subject?: string;
  grade?: string;
  topic?: string;
  chapter?: string;
  durationMinutes?: number;
}

export function generatePaperHTML(
  paper: PaperResponse,
  meta: PaperMeta,
  mode: "student" | "teacher"
): string {
  const isTeacher = mode === "teacher";
  const title = meta.title || "Question Paper";
  const subject = meta.subject || "Assessment";

  const metaLine = [
    meta.grade && `Grade: ${meta.grade}`,
    meta.chapter && `Chapter: ${meta.chapter}`,
    meta.topic && `Topic: ${meta.topic}`,
    meta.durationMinutes && `Duration: ${meta.durationMinutes} min`,
    `Total Marks: ${paper.totalMarks}`,
  ]
    .filter(Boolean)
    .join("  |  ");

  const sectionsHTML = paper.sections
    .map((section, sIdx) => {
      const questionsHTML = section.questions
        .map((q, qIdx) => {
          const optionsHTML =
            q.options && q.options.length > 0
              ? `<div class="options">${q.options
                .map(
                  (opt, oIdx) =>
                    `<div class="option">${String.fromCharCode(65 + oIdx)}) ${escapeHTML(opt)}</div>`
                )
                .join("")}</div>`
              : "";

          const answerHTML =
            isTeacher && q.answer
              ? `<div class="answer"><strong>Answer:</strong> ${escapeHTML(q.answer)}</div>`
              : "";

          const rubricHTML =
            isTeacher && q.rubric && q.rubric.length > 0
              ? `<div class="rubric"><strong>Rubric:</strong><ul>${q.rubric
                .map((r) => `<li>${escapeHTML(r)}</li>`)
                .join("")}</ul></div>`
              : "";

          // For student copy on long-answer questions, add blank lines
          const answerSpace =
            !isTeacher &&
              !q.options?.length &&
              (q.type === "LongAnswer" || q.type === "ShortAnswer")
              ? `<div class="answer-space" style="height:${q.type === "LongAnswer" ? "100px" : "50px"};border-bottom:1px dotted #ccc;"></div>`
              : "";

          return `
          <div class="question">
            <div class="question-header">
              <span class="question-num">Q${qIdx + 1}.</span>
              <span class="question-text">${escapeHTML(q.text)}</span>
              <span class="question-marks">[${q.marks} mark${q.marks !== 1 ? "s" : ""}]</span>
            </div>
            ${optionsHTML}
            ${answerSpace}
            ${answerHTML}
            ${rubricHTML}
          </div>`;
        })
        .join("");

      return `
      <div class="section">
        <div class="section-header">
          <h2>${escapeHTML(section.title)}</h2>
          <p class="section-instruction">${escapeHTML(section.instruction)}</p>
        </div>
        ${questionsHTML}
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(title)} – ${isTeacher ? "Teacher Copy" : "Student Copy"}</title>
<style>
  @page { margin: 18mm 15mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Times New Roman", "Georgia", serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1a1a1a;
    background: white;
  }

  .paper-header {
    text-align: center;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 14px;
    margin-bottom: 18px;
  }
  .paper-header h1 {
    font-size: 18pt;
    font-weight: 700;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
  }
  .paper-header .subject {
    font-size: 14pt;
    color: #333;
    margin-bottom: 4px;
  }
  .paper-header .meta-line {
    font-size: 10pt;
    color: #555;
  }
  .copy-badge {
    display: inline-block;
    margin-top: 6px;
    padding: 2px 14px;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border: 1.5px solid ${isTeacher ? "#c0392b" : "#2c3e50"};
    color: ${isTeacher ? "#c0392b" : "#2c3e50"};
    border-radius: 3px;
  }

  .student-info {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    border: 1px solid #ccc;
    padding: 10px 16px;
    margin-bottom: 18px;
    font-size: 11pt;
  }
  .student-info .field {
    flex: 1;
  }
  .student-info .field span {
    color: #666;
  }
  .student-info .field .line {
    display: inline-block;
    width: 140px;
    border-bottom: 1px solid #999;
    margin-left: 6px;
  }

  .instructions {
    border: 1px solid #ddd;
    padding: 10px 16px;
    margin-bottom: 20px;
    font-size: 10pt;
    background: #fafafa;
  }
  .instructions h3 {
    font-size: 10pt;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .instructions ul {
    padding-left: 18px;
    margin: 0;
  }
  .instructions li {
    margin-bottom: 2px;
  }

  .section {
    margin-bottom: 22px;
    page-break-inside: avoid;
  }
  .section-header {
    background: #f0f0f0;
    padding: 8px 14px;
    border-left: 4px solid #2c3e50;
    margin-bottom: 12px;
  }
  .section-header h2 {
    font-size: 13pt;
    font-weight: 700;
  }
  .section-instruction {
    font-size: 10pt;
    color: #555;
    font-style: italic;
    margin-top: 2px;
  }

  .question {
    margin-bottom: 14px;
    padding-left: 8px;
    page-break-inside: avoid;
  }
  .question-header {
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  .question-num {
    font-weight: 700;
    min-width: 30px;
    flex-shrink: 0;
  }
  .question-text {
    flex: 1;
  }
  .question-marks {
    font-weight: 600;
    color: #555;
    white-space: nowrap;
    font-size: 10pt;
    flex-shrink: 0;
  }

  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 24px;
    margin: 6px 0 0 36px;
    font-size: 11pt;
  }
  .option {
    padding: 2px 0;
  }

  .answer-space {
    margin: 8px 0 0 36px;
  }

  .answer {
    margin: 8px 0 0 36px;
    padding: 6px 12px;
    background: #e8f8e8;
    border-left: 3px solid #27ae60;
    font-size: 11pt;
  }
  .rubric {
    margin: 6px 0 0 36px;
    padding: 6px 12px;
    background: #fef9e7;
    border-left: 3px solid #f39c12;
    font-size: 10pt;
  }
  .rubric ul {
    padding-left: 16px;
    margin-top: 4px;
  }
  .rubric li {
    margin-bottom: 2px;
  }

  .footer {
    text-align: center;
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #ccc;
    font-size: 9pt;
    color: #888;
  }
</style>
</head>
<body>

<div class="paper-header">
  <h1>${escapeHTML(title)}</h1>
  <div class="subject">${escapeHTML(subject)}</div>
  <div class="meta-line">${escapeHTML(metaLine)}</div>
  <div class="copy-badge">${isTeacher ? "Teacher Copy" : "Student Copy"}</div>
</div>

${!isTeacher
      ? `<div class="student-info">
  <div class="field"><span>Name:</span> <span class="line"></span></div>
  <div class="field"><span>Class / Section:</span> <span class="line"></span></div>
  <div class="field"><span>Roll No:</span> <span class="line"></span></div>
</div>`
      : ""
    }

<div class="instructions">
  <h3>General Instructions:</h3>
  <ul>
    <li>All questions are compulsory unless stated otherwise.</li>
    <li>Read each question carefully before answering.</li>
    <li>Marks for each question are indicated in brackets.</li>
    ${meta.durationMinutes ? `<li>Time allowed: ${meta.durationMinutes} minutes.</li>` : ""}
  </ul>
</div>

${sectionsHTML}

<div class="footer">
  — End of ${isTeacher ? "Teacher Copy" : "Question Paper"} —
</div>

</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Open a new window with the generated HTML and trigger print (Save as PDF).
 */
export function downloadPaperAsPDF(
  paper: PaperResponse,
  meta: PaperMeta,
  mode: "student" | "teacher"
): void {
  const html = generatePaperHTML(paper, meta, mode);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    // Popup blocked fallback
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(meta.title || "paper").replace(/\s+/g, "_")}_${mode}_copy.html`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.addEventListener("load", () => {
    setTimeout(() => {
      printWindow.print();
    }, 300);
  });
}

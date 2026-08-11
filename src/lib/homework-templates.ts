import type { QuestionType } from "@/api/homework";

interface TemplateColumn {
  header: string;
  description: string;
  required: boolean;
}

const TEMPLATES: Record<QuestionType, { columns: TemplateColumn[]; sampleRow: string[] }> = {
  multiple_choice: {
    columns: [
      { header: "question", description: "The question text", required: true },
      { header: "option_a", description: "Option A", required: true },
      { header: "option_b", description: "Option B", required: true },
      { header: "option_c", description: "Option C", required: true },
      { header: "option_d", description: "Option D", required: true },
      { header: "correct_answer", description: "Correct option (A, B, C, or D)", required: true },
    ],
    sampleRow: ["What is 2 + 2?", "3", "4", "5", "6", "B"],
  },
  fill_blank: {
    columns: [
      { header: "question", description: "Question with _____ for the blank", required: true },
      { header: "correct_answer", description: "The correct answer to fill in", required: true },
    ],
    sampleRow: ["The capital of France is _____.", "Paris"],
  },
  true_false: {
    columns: [
      { header: "question", description: "The statement to evaluate", required: true },
      { header: "correct_answer", description: "TRUE or FALSE", required: true },
    ],
    sampleRow: ["The Earth is flat.", "FALSE"],
  },
  one_word: {
    columns: [
      { header: "question", description: "The question requiring a one-word answer", required: true },
      { header: "correct_answer", description: "The correct one-word answer", required: true },
    ],
    sampleRow: ["What is the chemical symbol for water?", "H2O"],
  },
  match_following: {
    columns: [
      { header: "left_item", description: "Item from the left column", required: true },
      { header: "right_item", description: "Matching item from the right column", required: true },
    ],
    sampleRow: ["India", "New Delhi"],
  },
};

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCsvContent(questionType: QuestionType): string {
  const template = TEMPLATES[questionType];
  if (!template) return "";

  const headerRow = template.columns.map((c) => escapeCsvCell(c.header)).join(",");
  const commentRow = template.columns.map((c) => escapeCsvCell(c.description)).join(",");
  const sampleRow = template.sampleRow.map((v) => escapeCsvCell(v)).join(",");

  return `${headerRow}\n${commentRow}\n${sampleRow}\n`;
}

export function downloadTemplateCsv(questionType: QuestionType): void {
  const csvContent = generateCsvContent(questionType);
  const template = TEMPLATES[questionType];

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `homework_template_${questionType}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getTemplateColumns(questionType: QuestionType): TemplateColumn[] {
  return TEMPLATES[questionType]?.columns ?? [];
}

export function getTemplatePreviewHtml(questionType: QuestionType): string {
  const template = TEMPLATES[questionType];
  if (!template) return "";

  const headers = template.columns.map((c) => `<th class="border border-slate-300 px-3 py-1.5 bg-slate-100 text-xs font-semibold text-slate-700">${c.header}</th>`).join("");
  const sample = template.sampleRow.map((v) => `<td class="border border-slate-300 px-3 py-1.5 text-xs text-slate-600">${v}</td>`).join("");

  return `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-xs">
        <thead><tr>${headers}</tr></thead>
        <tbody><tr>${sample}</tr></tbody>
      </table>
    </div>
  `;
}

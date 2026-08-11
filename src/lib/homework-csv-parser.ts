import type { QuestionType, QuizQuestion } from "@/api/homework";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseMultipleChoice(rows: string[][]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  // Skip header row (index 0) and description row (index 1)
  const dataRows = rows.slice(2);
  dataRows.forEach((row, idx) => {
    if (row.length < 6) return;
    const [question, optionA, optionB, optionC, optionD, correctAnswer] = row;
    if (!question) return;
    questions.push({
      id: idx + 1,
      question: question.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctAnswer: correctAnswer.trim().toUpperCase(),
      questionType: "multiple_choice",
    });
  });
  return questions;
}

function parseFillBlank(rows: string[][]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const dataRows = rows.slice(2);
  dataRows.forEach((row, idx) => {
    if (row.length < 2) return;
    const [question, correctAnswer] = row;
    if (!question) return;
    questions.push({
      id: idx + 1,
      question: question.trim(),
      options: [],
      correctAnswer: correctAnswer.trim(),
      questionType: "fill_blank",
    });
  });
  return questions;
}

function parseTrueFalse(rows: string[][]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const dataRows = rows.slice(2);
  dataRows.forEach((row, idx) => {
    if (row.length < 2) return;
    const [question, correctAnswer] = row;
    if (!question) return;
    questions.push({
      id: idx + 1,
      question: question.trim(),
      options: ["TRUE", "FALSE"],
      correctAnswer: correctAnswer.trim().toUpperCase(),
      questionType: "true_false",
    });
  });
  return questions;
}

function parseOneWord(rows: string[][]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const dataRows = rows.slice(2);
  dataRows.forEach((row, idx) => {
    if (row.length < 2) return;
    const [question, correctAnswer] = row;
    if (!question) return;
    questions.push({
      id: idx + 1,
      question: question.trim(),
      options: [],
      correctAnswer: correctAnswer.trim(),
      questionType: "one_word",
    });
  });
  return questions;
}

function parseMatchFollowing(rows: string[][]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const dataRows = rows.slice(2);
  // For match the following, each row is a pair; we group them into one question
  if (dataRows.length === 0) return questions;

  const leftItems: string[] = [];
  const rightItems: string[] = [];
  dataRows.forEach((row) => {
    if (row.length < 2) return;
    leftItems.push(row[0].trim());
    rightItems.push(row[1].trim());
  });

  if (leftItems.length > 0) {
    questions.push({
      id: 1,
      question: "Match the following items:",
      options: leftItems,
      correctAnswer: rightItems.join("|"),
      questionType: "match_following",
    });
  }
  return questions;
}

export function parseCsvToQuestions(
  csvText: string,
  questionType: QuestionType
): QuizQuestion[] {
  const lines = csvText.split("\n").filter((line) => line.trim().length > 0);
  const rows = lines.map(parseCsvLine);

  switch (questionType) {
    case "multiple_choice":
      return parseMultipleChoice(rows);
    case "fill_blank":
      return parseFillBlank(rows);
    case "true_false":
      return parseTrueFalse(rows);
    case "one_word":
      return parseOneWord(rows);
    case "match_following":
      return parseMatchFollowing(rows);
    default:
      return [];
  }
}

export async function fetchAndParseCsv(
  filePath: string,
  questionType: QuestionType
): Promise<QuizQuestion[]> {
  // Use a relative path so the request goes through the Vite proxy
  // (avoids Mixed Content / CORS issues when frontend is on HTTPS)
  const url = `/${filePath}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseCsvToQuestions(csvText, questionType);
}

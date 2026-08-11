import apiClient from "./client";

export type HomeworkType = "quiz" | "pdf";

export type QuestionType =
  | "multiple_choice"
  | "fill_blank"
  | "true_false"
  | "one_word"
  | "match_following";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType?: QuestionType;
}

export interface HomeworkItem {
  homeworkId?: number;
  id?: number;
  title: string;
  description: string;
  type: HomeworkType;
  classNo: string;
  subject: string;
  dueDate: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  questionType?: QuestionType;
  questions?: QuizQuestion[];
  contentRows?: string[][] | number;
  createdBy?: string;
  createdAt?: string;
}

export interface HomeworkPayload {
  title: string;
  description: string;
  type: HomeworkType;
  classNo: string;
  subject: string;
  dueDate: string;
  file?: File;
  questionType?: QuestionType;
}

const HOMEWORK_KEY = "homework_items";

export const fetchHomework = async (): Promise<HomeworkItem[]> => {
  try {
    const response = await apiClient.get("/api/v1/homework/get", {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return Array.isArray(raw) ? raw : [];
  } catch {
    const saved = localStorage.getItem(HOMEWORK_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveHomework = async (payload: HomeworkPayload): Promise<HomeworkItem> => {
  try {
    const formData = new FormData();

    // Backend expects @RequestPart("homework") — a JSON blob of the homework fields
    const homeworkBlob = new Blob(
      [
        JSON.stringify({
          title: payload.title,
          description: payload.description,
          type: payload.type,
          classNo: payload.classNo,
          subject: payload.subject,
          dueDate: payload.dueDate,
          questionType: payload.questionType,
        }),
      ],
      { type: "application/json" }
    );
    formData.append("homework", homeworkBlob);

    // Backend expects @RequestPart("file") — the uploaded file
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const response = await apiClient.post("/api/v1/homework/save", formData, {
      withCredentials: true,
      transformRequest: [(data) => data],
      headers: { "Content-Type": null },
    });
    const item = response.data?.body ?? response.data;
    const saved = localStorage.getItem(HOMEWORK_KEY);
    const items = saved ? JSON.parse(saved) : [];
    items.unshift(item);
    localStorage.setItem(HOMEWORK_KEY, JSON.stringify(items));
    return item;
  } catch {
    const saved = localStorage.getItem(HOMEWORK_KEY);
    const items: HomeworkItem[] = saved ? JSON.parse(saved) : [];
    const newItem: HomeworkItem = {
      homeworkId: Date.now(),
      title: payload.title,
      description: payload.description,
      type: payload.type,
      classNo: payload.classNo,
      subject: payload.subject,
      dueDate: payload.dueDate,
      fileName: payload.file?.name,
      questionType: payload.questionType,
      createdBy: "Local Admin",
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    localStorage.setItem(HOMEWORK_KEY, JSON.stringify(items));
    return newItem;
  }
};

export const fetchHomeworkById = async (id: number): Promise<HomeworkItem> => {
  const response = await apiClient.get(`/api/v1/homework/get/${id}`, {
    withCredentials: true,
  });
  const item: HomeworkItem = response.data?.body ?? response.data;

  // If it's a quiz with a CSV file, fetch and parse the questions
  if (item.type === "quiz" && item.filePath && item.questionType) {
    try {
      const { fetchAndParseCsv } = await import("@/lib/homework-csv-parser");
      const questions = await fetchAndParseCsv(item.filePath, item.questionType);
      item.questions = questions;
    } catch (err) {
      console.warn("Failed to parse CSV for homework:", item.homeworkId, err);
    }
  }

  return item;
};

export const deleteHomework = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/homework/delete/${id}`, {
      withCredentials: true,
    });
  } catch {
    const saved = localStorage.getItem(HOMEWORK_KEY);
    if (saved) {
      const items = JSON.parse(saved).filter((i: HomeworkItem) => i.id !== id);
      localStorage.setItem(HOMEWORK_KEY, JSON.stringify(items));
    }
  }
};

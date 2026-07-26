import apiClient from "./client";

export type HomeworkType = "quiz" | "pdf";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface HomeworkItem {
  id: number;
  title: string;
  description: string;
  type: HomeworkType;
  classNo: string;
  subject: string;
  dueDate: string;
  fileName?: string;
  fileUrl?: string;
  questions?: QuizQuestion[];
  contentRows?: string[][];
  createdBy: string;
  createdAt: string;
}

export interface HomeworkPayload {
  title: string;
  description: string;
  type: HomeworkType;
  classNo: string;
  subject: string;
  dueDate: string;
  file?: File;
}

const HOMEWORK_KEY = "homework_items";

export const fetchHomework = async (): Promise<HomeworkItem[]> => {
  try {
    const response = await apiClient.get("/api/v1/homework/all", {
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
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("type", payload.type);
    formData.append("classNo", payload.classNo);
    formData.append("subject", payload.subject);
    formData.append("dueDate", payload.dueDate);
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
      id: Date.now(),
      title: payload.title,
      description: payload.description,
      type: payload.type,
      classNo: payload.classNo,
      subject: payload.subject,
      dueDate: payload.dueDate,
      fileName: payload.file?.name,
      questions: undefined,
      contentRows: undefined,
      createdBy: "Local Admin",
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    localStorage.setItem(HOMEWORK_KEY, JSON.stringify(items));
    return newItem;
  }
};

export const deleteHomework = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/homework/${id}`, {
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

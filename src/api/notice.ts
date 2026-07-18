import apiClient from "./client";

export interface NoticePayload {
  title: string;
  description: string;
  tag: string;
  data: string; // "YYYY-MM-DD"
  sessionId: number;
}

export interface NoticeItem {
  id: number;
  title: string;
  description: string;
  tag: string;
  data: string; // "YYYY-MM-DD"
  sessionId: number;
}

export const saveNotice = async (payload: NoticePayload): Promise<NoticeItem> => {
  const response = await apiClient.post("/api/v1/notice/save", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchNotices = async (): Promise<NoticeItem[]> => {
  const response = await apiClient.get("/api/v1/notice/get", {
    withCredentials: true,
  });
  const raw = response.data?.data ?? response.data?.body ?? response.data;
  return Array.isArray(raw) ? raw : [];
};

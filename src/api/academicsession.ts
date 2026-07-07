import apiClient from "./client";

export interface AcademicSessionData {
  session_name: string;
  session_start_date: string;
  session_end_date: string;
  description?: string;
  is_active: boolean;
  is_current: boolean;
}

export interface SessionItem {
  sessionId: number;
  sessionName: string;
}

export const saveAcademicSession = async (data: AcademicSessionData) => {
  const response = await apiClient.post("/api/v1/session/save", data);
  return response.data;
};

export const fetchAcademicSessions = async () => {
  const response = await apiClient.get("/api/v1/session/all");
  return response.data;
};

export const fetchSessions = async (): Promise<SessionItem[]> => {
  const response = await apiClient.get("/api/v1/session/get");
  console.log("check session present or not", response.data);
  return response.data;
};

export const switchSession = async (sessionId: number) => {
  const response = await apiClient.get(`/api/v1/session/switch/session/${sessionId}`, { withCredentials: true });
  return response.data;
};
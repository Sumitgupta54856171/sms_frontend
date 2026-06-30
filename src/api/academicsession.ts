import apiClient from "./client";

export interface AcademicSessionData {
  session_name: string;
  session_start_date: string;
  session_end_date: string;
  description?: string;
  is_active: boolean;
  is_current: boolean;
}

export const saveAcademicSession = async (data: AcademicSessionData) => {
  const response = await apiClient.post("/api/v1/session/save", data);
  return response.data;
};

export const fetchAcademicSessions = async () => {
  const response = await apiClient.get("/api/v1/session/all");
  return response.data;
};
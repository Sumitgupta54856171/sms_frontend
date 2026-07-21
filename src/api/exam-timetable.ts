import apiClient from "./client";

export interface ExamTimetableEntry {
  testtimetableId?: number;
  timetableName: string;
  examType: "test" | "exam";
  classNO: string;
  subject: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  examcode?: number;
  maxMarks?: number;
  sessionId?: number;
}

export interface ExamTimetableGroup {
  examName: string;
  examType: "test" | "exam";
  entries: ExamTimetableEntry[];
}

// ─── Fetch all exam names ─────────────────────────────────────────────
export const fetchExamNames = async (): Promise<string[]> => {
  const response = await apiClient.get("/api/v1/timetable/examName", {
    withCredentials: true,
  });
  return response.data ?? [];
};

// ─── Fetch exam timetable by exam name ─────────────────────────────────
export const fetchExamTimetableByName = async (
  examName: string
): Promise<ExamTimetableEntry[]> => {
  try {
    const response = await apiClient.get(`/api/v1/timetable/examByName/${encodeURIComponent(examName)}`, {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return raw.map((item: any) => ({
      testtimetableId: item.testtimetableId ?? item.id,
      timetableName: item.timetableName ?? item.examName ?? item.exam_name ?? "",
      examType: item.examType ?? item.exam_type ?? "exam",
      classNO: item.classNO ?? item.classNo ?? item.gradeClass ?? item.grade_class ?? "",
      subject: item.subject ?? "",
      date: item.date ?? "",
      day: item.day ?? "",
      startTime: item.startTime ?? item.start_time ?? "",
      endTime: item.endTime ?? item.end_time ?? "",
      examcode: item.examcode ?? item.testCode ?? item.test_code,
      maxMarks: item.maxMarks ?? item.totalMarks ?? item.total_marks,
      sessionId: item.sessionId ?? item.session_id,
    }));
  } catch {
    return [];
  }
};

// ─── Save an exam timetable entry ──────────────────────────────────────
// Teacher is auto-filled by the backend based on JWT token.
export const saveExamTimetableEntry = async (
  data: ExamTimetableEntry
): Promise<any> => {
  const response = await apiClient.post("/api/v1/timetable/saveexamtimetable", data, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Bulk save exam timetable entries ──────────────────────────────────
export const bulkSaveExamTimetableEntries = async (
  entries: ExamTimetableEntry[]
): Promise<any> => {
  const response = await apiClient.post("/api/v1/timetable/saveexamtimetable", entries, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Delete an exam timetable entry ────────────────────────────────────
export const deleteExamTimetableEntry = async (entryId: number): Promise<any> => {
  const response = await apiClient.delete(`/api/v1/timetable/examtime/${entryId}`, {
    withCredentials: true,
  });
  return response.data;
};

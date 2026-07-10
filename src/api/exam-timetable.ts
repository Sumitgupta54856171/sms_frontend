import apiClient from "./client";

export interface ExamTimetableEntry {
  id?: number;
  examName: string;
  examType: "test" | "exam";
  gradeClass: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks?: number;
  testCode?: string;
  sessionId?: number;
}

export interface ExamTimetableGroup {
  examName: string;
  examType: "test" | "exam";
  entries: ExamTimetableEntry[];
}

// ─── Fetch all exam timetable entries ──────────────────────────────────
export const fetchAllExamTimetables = async (): Promise<ExamTimetableEntry[]> => {
  try {
    const response = await apiClient.get("/api/v1/exam-timetable/all", {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return raw.map((item: any) => ({
      id: item.id,
      examName: item.examName ?? item.exam_name ?? "",
      examType: item.examType ?? item.exam_type ?? "test",
      gradeClass: item.gradeClass ?? item.grade_class ?? "",
      subject: item.subject ?? "",
      date: item.date ?? "",
      startTime: item.startTime ?? item.start_time ?? "",
      endTime: item.endTime ?? item.end_time ?? "",
      totalMarks: item.totalMarks ?? item.total_marks,
      testCode: item.testCode ?? item.test_code ?? "",
      sessionId: item.sessionId ?? item.session_id,
    }));
  } catch {
    return [];
  }
};

// ─── Fetch exam timetable by grade ─────────────────────────────────────
export const fetchExamTimetableByGrade = async (
  gradeClass: string
): Promise<ExamTimetableEntry[]> => {
  try {
    const response = await apiClient.get(`/api/v1/exam-timetable/grade/${gradeClass}`, {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return raw.map((item: any) => ({
      id: item.id,
      examName: item.examName ?? item.exam_name ?? "",
      examType: item.examType ?? item.exam_type ?? "test",
      gradeClass: item.gradeClass ?? item.grade_class ?? "",
      subject: item.subject ?? "",
      date: item.date ?? "",
      startTime: item.startTime ?? item.start_time ?? "",
      endTime: item.endTime ?? item.end_time ?? "",
      totalMarks: item.totalMarks ?? item.total_marks,
      testCode: item.testCode ?? item.test_code ?? "",
      sessionId: item.sessionId ?? item.session_id,
    }));
  } catch {
    return [];
  }
};

// ─── Fetch exam timetable by exam name ─────────────────────────────────
export const fetchExamTimetableByName = async (
  examName: string
): Promise<ExamTimetableEntry[]> => {
  try {
    const response = await apiClient.get(`/api/v1/exam-timetable/name/${encodeURIComponent(examName)}`, {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return raw.map((item: any) => ({
      id: item.id,
      examName: item.examName ?? item.exam_name ?? "",
      examType: item.examType ?? item.exam_type ?? "test",
      gradeClass: item.gradeClass ?? item.grade_class ?? "",
      subject: item.subject ?? "",
      date: item.date ?? "",
      startTime: item.startTime ?? item.start_time ?? "",
      endTime: item.endTime ?? item.end_time ?? "",
      totalMarks: item.totalMarks ?? item.total_marks,
      testCode: item.testCode ?? item.test_code ?? "",
      sessionId: item.sessionId ?? item.session_id,
    }));
  } catch {
    return [];
  }
};

// ─── Save an exam timetable entry ──────────────────────────────────────
export const saveExamTimetableEntry = async (
  data: ExamTimetableEntry
): Promise<any> => {
  const response = await apiClient.post("/api/v1/exam-timetable/entry", data, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Bulk save exam timetable entries ──────────────────────────────────
export const bulkSaveExamTimetableEntries = async (
  entries: ExamTimetableEntry[]
): Promise<any> => {
  const response = await apiClient.post("/api/v1/exam-timetable/entries/bulk", entries, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Delete an exam timetable entry ────────────────────────────────────
export const deleteExamTimetableEntry = async (entryId: number): Promise<any> => {
  const response = await apiClient.delete(`/api/v1/exam-timetable/entry/${entryId}`, {
    withCredentials: true,
  });
  return response.data;
};

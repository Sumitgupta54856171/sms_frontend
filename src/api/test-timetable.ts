import apiClient from "./client";
import { parseTimetableNameList } from "@/lib/timetable-names";

export interface TestTimetableEntry {
  testtimetableId?: number;
  timetableName: string;
  classNO: string;
  subject: string;
  day: string;
  date?: string;
  testcode?: number;
  sessionId?: number;
  maxMarks?: number;
}

// ─── Fetch all test names ─────────────────────────────────────────────
export const fetchTestNames = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get("/api/v1/timetable/testName", {
      withCredentials: true,
    });
    return parseTimetableNameList(response.data);
  } catch {
    return [];
  }
};

// ─── Fetch test timetable entries by test name ────────────────────────
export const fetchTestTimetableByName = async (
  testName: string
): Promise<TestTimetableEntry[]> => {
  const response = await apiClient.get(
    `/api/v1/timetable/testByName/${encodeURIComponent(testName)}`,
    { withCredentials: true }
  );
  console.log(`Fetched test timetable entries for test name "${testName}":`, response.data);
  const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
  return (Array.isArray(raw) ? raw : []).map((item: any) => ({
    testtimetableId: item.testtimetableId ?? item.id,
    timetableName: item.timetableName ?? item.testName ?? item.test_name ?? "",
    classNO: item.classNO ?? item.classNo ?? item.gradeClass ?? item.grade_class ?? "",
    subject: item.subject ?? "",
    date: item.date ?? "",
    day: item.day ?? "",
    testcode: item.testcode ?? item.testCode ?? item.test_code,
    maxMarks: item.maxMarks ?? item.totalMarks ?? item.total_marks,
    sessionId: item.sessionId ?? item.session_id,
  }));
};

// ─── Delete a test timetable entry ────────────────────────────────────
export const deleteTestTimetableEntry = async (entryId: number): Promise<any> => {
  const response = await apiClient.delete(`/api/v1/timetable/testtime/${entryId}`, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Save test timetable entries ──────────────────────────────────────
// Teacher is auto-filled by the backend based on JWT token.
// Backend expects a JSON array directly.
export const saveTestTimetable = async (
  data: TestTimetableEntry | TestTimetableEntry[]
): Promise<any> => {
  const entries = Array.isArray(data) ? data : [data];
  const response = await apiClient.post(
    "/api/v1/timetable/savetesttimetable",
    entries,
    { withCredentials: true }
  );
  return response.data;
};

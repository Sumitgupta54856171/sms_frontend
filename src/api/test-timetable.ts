import apiClient from "./client";

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
  const response = await apiClient.get("/api/v1/timetable/testName", {
    withCredentials: true,
  });
  console.log("Fetched test names:", response.data);
  return response.data ?? [];
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
  return response.data;
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

import apiClient from "./client";

// ─── Payload for saving exam marks (matches ExamGrade entity) ──────────
export interface ExamGradePayload {
  studentId: number;
  teacherId: number;
  subject: string;
  sessionId?: number | null;
  classNo: string;
  mark: number;
  examtimetableId?: number;
}

// ─── Payload for saving test marks (matches TestGrade entity) ──────────
export interface TestGradePayload {
  studentId: number;
  teacherId: number;
  subject: string;
  sessionId?: number | null;
  classNo: string;
  mark: number;
  testTimetable?: { testtimetableId: number };
}

// ─── Response from GET /get/mark/{teacherId}/{subject}/{grade}/{type}/{examid} ──
export interface GradeMarkResponse {
  studentId: number;
  teacherId: number;
  subject: string;
  sessionId?: number;
  classNo: string;
  mark: number;
  examgradeid?: number;
  testgradeid?: number;
}

// ─── Response from GET /get/mark/{classNo}/{testname}/{checkmark} ──
export interface ClassAssessmentMark {
  studentId: number;
  studentName?: string;
  subject: string;
  classNo?: string;
  mark: number;
  maxMarks?: number;
}

// ─── Fetch existing marks ──────────────────────────────────────────────
// GET /api/v1/grade/get/mark/{teacherId}/{subject}/{grade}/{type}/{examid}
export const fetchMarks = async (
  teacherId: string,
  subject: string,
  grade: string,
  type: "test" | "exam",
  examid: number
): Promise<GradeMarkResponse[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/grade/get/mark/${encodeURIComponent(teacherId)}/${encodeURIComponent(subject)}/${encodeURIComponent(grade)}/${type}/${examid}`,
      { withCredentials: true }
    );
    console.log("check the mark response:", response.data);
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

// GET /api/v1/grade/get/mark/{classNo}/{testname}/{checkmark}
export const fetchMarksByClassAndAssessment = async (
  classNo: string,
  testname: string,
  checkmark: "test" | "exam"
): Promise<ClassAssessmentMark[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/grade/get/mark/${classNo}/${encodeURIComponent(testname)}/${checkmark}`,
      { withCredentials: true }
    );
    console.log("check the progroess report",response.data)
    const raw = response.data?.body ?? response.data?.data ?? response.data ?? [];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

// ─── Save exam marks (bulk) ────────────────────────────────────────────
// POST /api/v1/grade/exam/mark/save — backend expects ArrayList<ExamGrade>
export const saveExamMarks = async (payloads: ExamGradePayload[]): Promise<any> => {
  const response = await apiClient.post("/api/v1/grade/exam/mark/save", payloads, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Save test marks (bulk) ────────────────────────────────────────────
// POST /api/v1/grade/test/mark/save — backend expects ArrayList<TestGrade>
export const saveTestMarks = async (payloads: TestGradePayload[]): Promise<any> => {
  const response = await apiClient.post("/api/v1/grade/test/mark/save", payloads, {
    withCredentials: true,
  });
  return response.data;
};

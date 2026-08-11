import apiClient from "./client";
import { fetchExamNames, fetchExamTimetableByName, type ExamTimetableEntry } from "./exam-timetable";
import { fetchStudentsByClass } from "./student";

// ─── Re-export existing API functions for convenience ──────────────────
export { fetchExamNames, fetchExamTimetableByName };
export type { ExamTimetableEntry };

// ─── Fetch students for admit card (wraps existing API) ────────────────
export interface AdmitCardStudent {
  id: number;
  name: string;
  fatherName: string;
  motherName: string;
  className: string;
  rollNo: string;
  scholarNo: string;
  photoUrl?: string;
}

export const fetchAdmitCardStudents = async (classNo: string): Promise<AdmitCardStudent[]> => {
  const data = await fetchStudentsByClass(classNo);
  const raw = data?.studentdetail ?? data?.data ?? [];
  if (!Array.isArray(raw)) return [];

  return raw.map((s: any) => ({
    id: s.studentId ?? s.id ?? s.student_id,
    name: s.studentName ?? s.name ?? "",
    fatherName: s.faterhName ?? s.father_name ?? s.fatherName ?? "",
    motherName: s.motherName ?? s.mother_name ?? "",
    className: s.className ?? s.class_no ?? classNo,
    rollNo: s.rolleNo ?? s.rollNo ?? s.roll_no ?? "",
    scholarNo: s.scholarNo ?? s.scholar_no ?? "",
  }));
};

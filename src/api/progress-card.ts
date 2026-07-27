import apiClient from "./client";
import { fetchExamTimetableByName, type ExamTimetableEntry } from "./exam-timetable";
import { fetchTestTimetableByName, type TestTimetableEntry } from "./test-timetable";
import { fetchMarks, type GradeMarkResponse } from "./grade";
import { fetchStudentsByClass } from "./student";

export type AssessmentType = "test" | "exam";

export interface SubjectMark {
  subject: string;
  maxMarks: number;
  obtained: number;
  grade: string;
  remarks: string;
}

export interface StudentProgressCard {
  studentId: number;
  name: string;
  rollNo: string;
  scholarNo: string;
  fatherName: string;
  motherName: string;
  gender?: string;
  dob?: string;
  className: string;
  subjects: SubjectMark[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  result: string;
}

export interface AssessmentOption {
  name: string;
  type: AssessmentType;
}

function getGrade(percentage: number): string {
  if (percentage >= 91) return "A1";
  if (percentage >= 81) return "A2";
  if (percentage >= 71) return "B1";
  if (percentage >= 61) return "B2";
  if (percentage >= 51) return "C1";
  if (percentage >= 41) return "C2";
  if (percentage >= 33) return "D";
  return "E";
}

function getRemarks(grade: string): string {
  switch (grade) {
    case "A1":
    case "A2":
      return "Excellent";
    case "B1":
    case "B2":
      return "Good";
    case "C1":
    case "C2":
      return "Satisfactory";
    case "D":
      return "Needs Improvement";
    default:
      return "Unsatisfactory";
  }
}

export const fetchAssessmentNames = async (): Promise<AssessmentOption[]> => {
  try {
    const [examNames, testNames] = await Promise.all([
      (async () => {
        const response = await apiClient.get("/api/v1/timetable/examName", { withCredentials: true });
        return response.data ?? [];
      })(),
      (async () => {
        const response = await apiClient.get("/api/v1/timetable/testName", { withCredentials: true });
        return response.data ?? [];
      })(),
    ]);
    const exams: AssessmentOption[] = (examNames ?? []).map((n: string) => ({ name: n, type: "exam" }));
    const tests: AssessmentOption[] = (testNames ?? []).map((n: string) => ({ name: n, type: "test" }));
    return [...exams, ...tests];
  } catch {
    return [];
  }
};

export const fetchProgressCards = async (
  assessmentName: string,
  type: AssessmentType,
  className: string
): Promise<StudentProgressCard[]> => {
  let timetableEntries: Array<{ subject: string; maxMarks?: number; examid: number; classNO: string }> = [];

  if (type === "exam") {
    const entries = await fetchExamTimetableByName(assessmentName);
    timetableEntries = entries
      .filter((e) => e.classNO === className)
      .map((e) => ({
        subject: e.subject,
        maxMarks: e.maxMarks,
        examid: e.testtimetableId ?? e.examcode ?? 0,
        classNO: e.classNO,
      }));
  } else {
    const entries = await fetchTestTimetableByName(assessmentName);
    timetableEntries = entries
      .filter((e) => e.classNO === className)
      .map((e) => ({
        subject: e.subject,
        maxMarks: e.maxMarks,
        examid: e.testtimetableId ?? e.testcode ?? 0,
        classNO: e.classNO,
      }));
  }

  if (timetableEntries.length === 0) return [];

  const studentsResponse = await fetchStudentsByClass(className);
  const studentList = studentsResponse?.studentdetail ?? studentsResponse?.data ?? studentsResponse ?? [];

  const studentMap = new Map<number, StudentProgressCard>();

  for (const entry of timetableEntries) {
    if (!entry.examid) continue;
    const marks = await fetchMarks("0", entry.subject, className, type, entry.examid);
    const maxMarks = entry.maxMarks ?? 100;

    marks.forEach((m: GradeMarkResponse) => {
      const sid = m.studentId;
      if (!studentMap.has(sid)) {
        const raw = studentList.find((s: any) => (s.student?.id ?? s.id) === sid) ?? {};
        const studentObj = raw.student ?? raw;
        studentMap.set(sid, {
          studentId: sid,
          name: studentObj.name ?? m.studentName ?? "—",
          rollNo: raw.roll_no ?? raw.rollNo ?? "—",
          scholarNo: studentObj.scholar_no ?? "—",
          fatherName: studentObj.father_name ?? "—",
          motherName: studentObj.mother_name ?? "—",
          gender: studentObj.gender,
          dob: studentObj.dob,
          className,
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
          percentage: 0,
          overallGrade: "E",
          result: "Fail",
        });
      }
      const card = studentMap.get(sid)!;
      const obtained = typeof m.mark === "number" ? m.mark : Number(m.mark) || 0;
      const percentage = maxMarks > 0 ? (obtained / maxMarks) * 100 : 0;
      const grade = getGrade(percentage);
      card.subjects.push({
        subject: entry.subject,
        maxMarks,
        obtained,
        grade,
        remarks: getRemarks(grade),
      });
      card.totalObtained += obtained;
      card.totalMax += maxMarks;
    });
  }

  const cards = Array.from(studentMap.values());
  cards.forEach((card) => {
    card.percentage = card.totalMax > 0 ? (card.totalObtained / card.totalMax) * 100 : 0;
    card.overallGrade = getGrade(card.percentage);
    card.result = card.percentage >= 33 ? "Pass" : "Fail";
  });

  return cards.sort((a, b) => a.name.localeCompare(b.name));
};

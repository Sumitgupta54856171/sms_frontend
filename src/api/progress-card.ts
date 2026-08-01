import { fetchMarksByClassAndAssessment } from "./grade";
import { fetchStudentsByClass, fetchStudentDetail } from "./student";
import { fetchExamNames, fetchExamTimetableByName } from "./exam-timetable";
import { fetchTestNames, fetchTestTimetableByName } from "./test-timetable";

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

/** API class value: "Grade 9" → "9", keep Nursery/LKG/UKG as-is */
export function normalizeClassForApi(className: string): string {
  const match = className.match(/^Grade\s+(\d+)$/i);
  return match ? match[1] : className;
}

/** Display label for class dropdown */
export function getClassDisplayLabel(className: string): string {
  if (["Nursery", "LKG", "UKG", "Grade 12"].includes(className)) return className;
  if (/^\d+$/.test(className)) return `Grade ${className}`;
  return className;
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

interface StudentDetailRow {
  studentId?: number;
  id?: number;
  roll_no?: string;
  rolleNo?: string;
  studentName?: string;
  scholarNo?: string;
  student?: {
    id?: number;
    name?: string;
    scholar_no?: string;
    father_name?: string;
    mother_name?: string;
    gender?: string;
    dob?: string;
  };
}

function mapStudentRow(raw: StudentDetailRow) {
  const studentObj = raw.student ?? {};
  return {
    studentId: raw.studentId ?? studentObj.id ?? raw.id ?? 0,
    name: raw.studentName ?? studentObj.name ?? "—",
    rollNo: raw.roll_no ?? raw.rolleNo ?? "—",
    scholarNo: raw.scholarNo ?? studentObj.scholar_no ?? "—",
    fatherName: studentObj.father_name ?? "—",
    motherName: studentObj.mother_name ?? "—",
    gender: studentObj.gender ?? "",
    dob: studentObj.dob ?? "",
  };
}

export const fetchAssessmentNames = async (): Promise<AssessmentOption[]> => {
  try {
    const [examNames, testNames] = await Promise.all([fetchExamNames(), fetchTestNames()]);
    const exams: AssessmentOption[] = (examNames ?? []).map((n) => ({ name: n, type: "exam" as const }));
    const tests: AssessmentOption[] = (testNames ?? []).map((n) => ({ name: n, type: "test" as const }));
    return [...exams, ...tests];
  } catch {
    return [];
  }
};

export const fetchProgressCards = async (
  className: string,
  assessmentName: string,
  type: AssessmentType
): Promise<StudentProgressCard[]> => {
  const apiClassNo = normalizeClassForApi(className);
  const displayClass = getClassDisplayLabel(className);

  const studentsResponse = await fetchStudentsByClass(apiClassNo);
  const studentList: StudentDetailRow[] =
    studentsResponse?.studentdetail ?? studentsResponse?.data ?? [];

  const studentMap = new Map<number, ReturnType<typeof mapStudentRow>>();
  studentList.forEach((row) => {
    const mapped = mapStudentRow(row);
    if (mapped.studentId) studentMap.set(mapped.studentId, mapped);
  });

  // Fetch parent details (father_name, mother_name) for each student
  // since fetchStudentsByClass doesn't include them
  await Promise.all(
    Array.from(studentMap.keys()).map(async (sid) => {
      try {
        const detail = await fetchStudentDetail(sid);
        if (detail?.student) {
          const existing = studentMap.get(sid);
          if (existing) {
            existing.fatherName = detail.student.father_name || "—";
            existing.motherName = detail.student.mother_name || "—";
          }
        }
      } catch {
        // Keep defaults if detail fetch fails
      }
    })
  );

  // Fetch timetable entries to get the real maxMarks per subject for this class+assessment
  let subjectMaxMarks: Record<string, number> = {};
  try {
    const timetableEntries =
      type === "exam"
        ? await fetchExamTimetableByName(assessmentName)
        : await fetchTestTimetableByName(assessmentName);
    // Filter entries for this class and build subject → maxMarks map
    timetableEntries
      .filter((e) => e.classNO === displayClass || e.classNO === apiClassNo)
      .forEach((e) => {
        if (e.subject && e.maxMarks) {
          subjectMaxMarks[e.subject] = e.maxMarks;
        }
      });
  } catch {
    // If timetable fetch fails, fall back to marks' maxMarks or default
  }

  // Use displayClass for marks API (DB stores "Grade 6", not "6")
  // but use normalized apiClassNo for fetchStudentsByClass
  const marks = await fetchMarksByClassAndAssessment(displayClass, assessmentName, type);
  if (marks.length === 0) return [];

  const cardMap = new Map<number, StudentProgressCard>();

  marks.forEach((m) => {
    const sid = m.studentId;
    if (!sid) return;

    const studentInfo = studentMap.get(sid);

    if (!cardMap.has(sid)) {
      cardMap.set(sid, {
        studentId: sid,
        name: studentInfo?.name ?? m.studentName ?? "—",
        rollNo: studentInfo?.rollNo ?? "—",
        scholarNo: studentInfo?.scholarNo ?? "—",
        fatherName: studentInfo?.fatherName ?? "—",
        motherName: studentInfo?.motherName ?? "—",
        gender: studentInfo?.gender,
        dob: studentInfo?.dob,
        className: displayClass,
        subjects: [],
        totalObtained: 0,
        totalMax: 0,
        percentage: 0,
        overallGrade: "E",
        result: "Fail",
      });
    }

    const card = cardMap.get(sid)!;
    const obtained = typeof m.mark === "number" ? m.mark : Number(m.mark) || 0;
    // Use maxMarks from timetable if available, otherwise from marks response, otherwise default 100
    const maxMarks = subjectMaxMarks[m.subject ?? ""] ?? m.maxMarks ?? 100;
    const pct = maxMarks > 0 ? (obtained / maxMarks) * 100 : 0;
    const grade = getGrade(pct);

    card.subjects.push({
      subject: m.subject ?? "—",
      maxMarks,
      obtained,
      grade,
      remarks: getRemarks(grade),
    });
    card.totalObtained += obtained;
    card.totalMax += maxMarks;
  });

  const cards = Array.from(cardMap.values());
  cards.forEach((card) => {
    card.percentage = card.totalMax > 0 ? (card.totalObtained / card.totalMax) * 100 : 0;
    card.overallGrade = getGrade(card.percentage);
    card.result = card.percentage >= 33 ? "Pass" : "Fail";
  });

  return cards.sort((a, b) => a.name.localeCompare(b.name));
};

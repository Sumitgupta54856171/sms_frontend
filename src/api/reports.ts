import apiClient from "./client";
import { fetchSessions } from "./academicsession";
import { fetchAttendanceByDate } from "./attendance";
import { fetchInvoiceHistory } from "./fee";
import { fetchStudents } from "./student";
import { fetchTeachers } from "./teacher";
import { fetchNotices } from "./notice";
import { fetchEvents } from "./event";
import { fetchExamNames, fetchExamTimetableByName } from "./exam-timetable";

export type ReportType =
  | "session"
  | "attendance"
  | "fees"
  | "students"
  | "teachers"
  | "exams"
  | "notices"
  | "events";

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportData {
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getSessionStart(): string {
  const now = new Date();
  const year = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  return `${year}-04-01`;
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

// ─── Session Report ────────────────────────────────────────────────────
async function fetchSessionReport(): Promise<ReportData> {
  const sessions = await fetchSessions();
  const rows = Array.isArray(sessions)
    ? sessions.map((s: any) => ({
        sessionId: safeNumber(s.sessionId ?? s.id),
        sessionName: safeString(s.sessionName ?? s.session_name ?? ""),
        startDate: safeString(s.session_start_date ?? ""),
        endDate: safeString(s.session_end_date ?? ""),
        status: s.is_active || s.is_current ? "Active" : "Inactive",
      }))
    : [];
  return {
    columns: [
      { key: "sessionId", label: "Session ID" },
      { key: "sessionName", label: "Session Name" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "status", label: "Status" },
    ],
    rows,
  };
}

// ─── Attendance Report ─────────────────────────────────────────────────
async function fetchAttendanceReport(): Promise<ReportData> {
  const date = getToday();
  const records = await fetchAttendanceByDate(date);
  const rows = Array.isArray(records)
    ? records.map((r: any) => ({
        date: safeString(r.attendanceDate ?? date),
        studentId: safeNumber(r.studentId),
        studentName: safeString(r.studentName),
        grade: safeString(r.grade),
        rollNumber: safeString(r.rollNumber),
        scholarNo: safeString(r.scholarNo),
        status: safeString(r.status).charAt(0).toUpperCase() + safeString(r.status).slice(1),
      }))
    : [];
  return {
    columns: [
      { key: "date", label: "Date" },
      { key: "studentId", label: "Student ID" },
      { key: "studentName", label: "Student Name" },
      { key: "grade", label: "Grade" },
      { key: "rollNumber", label: "Roll No" },
      { key: "scholarNo", label: "Scholar No" },
      { key: "status", label: "Status" },
    ],
    rows,
  };
}

// ─── Fees Report ───────────────────────────────────────────────────────
async function fetchFeesReport(): Promise<ReportData> {
  const start = getSessionStart();
  const end = getToday();
  const history = await fetchInvoiceHistory(start, end);
  const invoices = Array.isArray(history?.invoice) ? history.invoice : [];
  const rows = invoices.map((item: any) => ({
    invoiceId: safeNumber(item.invoiceId ?? item.id),
    studentName: safeString(item.studentName),
    invoiceDate: safeString(item.invoiceDate ?? item.date ?? ""),
    paymentMethod: safeString(item.paymentMethod),
    amount: safeNumber(item.amount),
  }));
  return {
    columns: [
      { key: "invoiceId", label: "Invoice ID" },
      { key: "studentName", label: "Student Name" },
      { key: "invoiceDate", label: "Invoice Date" },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "amount", label: "Amount (₹)" },
    ],
    rows,
  };
}

// ─── Students Report ───────────────────────────────────────────────────
async function fetchStudentsReport(): Promise<ReportData> {
  const students = await fetchStudents();
  const rows = Array.isArray(students)
    ? students.map((s: any) => ({
        studentId: safeNumber(s.id),
        name: safeString(s.name),
        email: safeString(s.email),
        classInfo: safeString(s.classInfo),
        roll: safeString(s.roll),
        scholarNo: safeString(s.scholar_no),
        parent: safeString(s.parent ?? s.father_name),
        status: safeString(s.status),
      }))
    : [];
  return {
    columns: [
      { key: "studentId", label: "Student ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "classInfo", label: "Class" },
      { key: "roll", label: "Roll No" },
      { key: "scholarNo", label: "Scholar No" },
      { key: "parent", label: "Parent" },
      { key: "status", label: "Status" },
    ],
    rows,
  };
}

// ─── Teachers Report ───────────────────────────────────────────────────
async function fetchTeachersReport(): Promise<ReportData> {
  const teachers = await fetchTeachers();
  const rows = Array.isArray(teachers)
    ? teachers.map((t: any) => ({
        teacherId: safeNumber(t.id ?? t.teacher_id),
        name: safeString(t.fullName ?? t.name),
        email: safeString(t.email),
        employeeId: safeString(t.employee_id),
        subject: safeString(t.subject_specialization),
        phone: safeString(t.phone),
        status: safeString(t.status),
      }))
    : [];
  return {
    columns: [
      { key: "teacherId", label: "Teacher ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "employeeId", label: "Employee ID" },
      { key: "subject", label: "Subject" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ],
    rows,
  };
}

// ─── Exams Report ────────────────────────────────────────────────────────
async function fetchExamsReport(): Promise<ReportData> {
  const examNames = await fetchExamNames();
  const names = Array.isArray(examNames) ? examNames : [];
  const rows: Record<string, string | number>[] = [];
  for (const name of names) {
    if (!name) continue;
    try {
      const entries = await fetchExamTimetableByName(name);
      if (Array.isArray(entries)) {
        entries.forEach((e: any) => {
          rows.push({
            examName: safeString(e.timetableName ?? name),
            subject: safeString(e.subject),
            classNO: safeString(e.classNO),
            date: safeString(e.date),
            day: safeString(e.day),
            startTime: safeString(e.startTime),
            endTime: safeString(e.endTime),
            maxMarks: safeNumber(e.maxMarks),
          });
        });
      }
    } catch {
      // Skip exams that fail to load
    }
  }
  return {
    columns: [
      { key: "examName", label: "Exam Name" },
      { key: "subject", label: "Subject" },
      { key: "classNO", label: "Class" },
      { key: "date", label: "Date" },
      { key: "day", label: "Day" },
      { key: "startTime", label: "Start Time" },
      { key: "endTime", label: "End Time" },
      { key: "maxMarks", label: "Max Marks" },
    ],
    rows,
  };
}

// ─── Notices Report ─────────────────────────────────────────────────────
async function fetchNoticesReport(): Promise<ReportData> {
  const notices = await fetchNotices();
  const rows = Array.isArray(notices)
    ? notices.map((n: any) => ({
        id: safeNumber(n.id),
        title: safeString(n.title),
        tag: safeString(n.tag),
        date: safeString(n.data),
        description: safeString(n.description),
      }))
    : [];
  return {
    columns: [
      { key: "id", label: "Notice ID" },
      { key: "title", label: "Title" },
      { key: "tag", label: "Category" },
      { key: "date", label: "Date" },
      { key: "description", label: "Description" },
    ],
    rows,
  };
}

// ─── Events Report ──────────────────────────────────────────────────────
async function fetchEventsReport(): Promise<ReportData> {
  const events = await fetchEvents();
  const rows = Array.isArray(events)
    ? events.map((e: any) => ({
        id: safeNumber(e.eventid ?? e.id),
        name: safeString(e.eventname ?? e.name),
        date: safeString(e.eventdate ?? e.date),
        venue: safeString(e.venue),
        color: safeString(e.color),
      }))
    : [];
  return {
    columns: [
      { key: "id", label: "Event ID" },
      { key: "name", label: "Event Name" },
      { key: "date", label: "Date" },
      { key: "venue", label: "Venue" },
      { key: "color", label: "Color" },
    ],
    rows,
  };
}

// ─── Generic dispatcher ──────────────────────────────────────────────
export const fetchReportData = async (type: ReportType): Promise<ReportData> => {
  switch (type) {
    case "session":
      return fetchSessionReport();
    case "attendance":
      return fetchAttendanceReport();
    case "fees":
      return fetchFeesReport();
    case "students":
      return fetchStudentsReport();
    case "teachers":
      return fetchTeachersReport();
    case "exams":
      return fetchExamsReport();
    case "notices":
      return fetchNoticesReport();
    case "events":
      return fetchEventsReport();
    default:
      return { columns: [], rows: [] };
  }
};

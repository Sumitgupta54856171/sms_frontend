import apiClient from "./client";

export interface AttendanceRecord {
  attendanceId: number;
  attendanceDate: string; // "YYYY-MM-DD"
  status: "present" | "absent" | "holiday";
  studentId: number;
  studentName: string;
  grade: string;
  rollNumber: string;
  scholarNo: string;
}

export type AttendanceStatus = "present" | "absent" | "holiday";

export interface AttendancePayload {
  attendanceDate: string;
  studentId: number;
  status: AttendanceStatus;
  grade?: string;
}

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present", "absent", "holiday"];

const parseAttendanceStatus = (status: unknown): AttendanceStatus | null => {
  const value = String(status ?? "").toLowerCase();
  return ATTENDANCE_STATUSES.includes(value as AttendanceStatus)
    ? (value as AttendanceStatus)
    : null;
};

// ─── Save attendance (batch) ───────────────────────────────────────────
export const saveAttendance = async (
  records: AttendancePayload[]
): Promise<any> => {
    console.log("check the attendance records is ", records)
  const response = await apiClient.post(
    "/api/v1/attendance/save",
    records,
    { withCredentials: true }
  );
  return response.data;
};

// ─── Update attendance (individual) ────────────────────────────────────
export const updateAttendance = async (
  studentId: number,
  status: "present" | "absent" | "holiday",
  date: string
): Promise<any> => {
  const response = await apiClient.put(
    `/api/v1/attendance/${studentId}/${status}/${date}`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

// ─── Fetch attendance by date ──────────────────────────────────────────
export const fetchAttendanceByDate = async (
  date: string
): Promise<AttendanceRecord[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/attendance/date/${date}`,
      { withCredentials: true }
    );
    console.log("API response for attendance by date:", response.data);
    const raw = response.data?.data ?? response.data ?? [];
    return raw.flatMap((item: any) => {
      const status = parseAttendanceStatus(item.status);
      if (!status) return [];
      const mapped: AttendanceRecord = {
        attendanceId: item.attendanceId ?? item.attendance_id,
        attendanceDate: item.attendanceDate ?? item.attendance_date,
        status,
        studentId: item.studentId ?? item.student_id,
        studentName: item.studentName ?? item.student_name ?? "",
        grade: item.grade ?? "",
        rollNumber: item.rollNumber ?? item.roll_number ?? "",
        scholarNo: item.scholarNo ?? item.scholar_no ?? "",
      };
      console.log("Mapped attendance record:", mapped);
      return [mapped];
    });
  } catch (error) {
    console.warn("Failed to fetch attendance:", error);
    return [];
  }
};

// ─── Fetch attendance by class and date ────────────────────────────────
export const fetchAttendanceByClassAndDate = async (
  classNo: string,
  date: string
): Promise<AttendanceRecord[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/attendance/date/${date}`,
      { withCredentials: true }
    );
    console.log("API response for attendance by class/date:", response.data);
    const raw = response.data?.body ?? response.data ?? [];
    return raw.flatMap((item: any) => {
      const status = parseAttendanceStatus(item.status);
      if (!status) return [];
      const mapped: AttendanceRecord = {
        attendanceId: item.attendanceId ?? item.attendance_id,
        attendanceDate: item.attendanceDate ?? item.attendance_date,
        status,
        studentId: item.studentId ?? item.student_id,
        studentName: item.studentName ?? item.student_name ?? "",
        grade: item.grade ?? "",
        rollNumber: item.rollNumber ?? item.roll_number ?? "",
        scholarNo: item.scholarNo ?? item.scholar_no ?? "",
      };
      console.log("Mapped attendance record:", mapped);
      return [mapped];
    });
  } catch (error) {
    console.warn("Failed to fetch attendance by class/date:", error);
    return [];
  }
};

// ─── Attendance record with gender ─────────────────────────────────────
export interface AttendanceRecordWithGender extends AttendanceRecord {
  gender?: string;
}

// ─── Fetch attendance by date range ────────────────────────────────────
// GET /api/v1/attendance/dateAttendance/{startdate}/{enddate}
export const fetchAttendanceByDateRange = async (
  startDate: string,
  endDate: string
): Promise<AttendanceRecordWithGender[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/attendance/dateAttendance/${startDate}/${endDate}`,
      { withCredentials: true }
    );
    console.log("API response for attendance by date range:", response.data);
    const raw = response.data?.data ?? response.data?.body ?? response.data ?? [];
    return raw.flatMap((item: any) => {
      const status = parseAttendanceStatus(item.status);
      if (!status) return [];
      const mapped: AttendanceRecordWithGender = {
        attendanceId: item.attendanceId ?? item.attendance_id,
        attendanceDate: item.attendanceDate ?? item.attendance_date,
        status,
        studentId: item.studentId ?? item.student_id,
        studentName: item.studentName ?? item.student_name ?? "",
        grade: item.grade ?? "",
        rollNumber: item.rollNumber ?? item.roll_number ?? "",
        scholarNo: item.scholarNo ?? item.scholar_no ?? "",
        gender: item.gender ?? "",
      };
      return [mapped];
    });
  } catch (error) {
    console.warn("Failed to fetch attendance by date range:", error);
    return [];
  }
};

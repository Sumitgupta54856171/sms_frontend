import apiClient from "./client";

export interface AttendanceRecord {
  id?: number;
  attendanceDate: string; // "YYYY-MM-DD"
  status: "PRESENT" | "ABSENT";
  student_id: number;
  marked_by_teacher_id?: number;
  student?: {
    id: number;
    name: string;
  };
}

export interface AttendancePayload {
  attendanceDate: string;
  student_id: number;
  status: "PRESENT" | "ABSENT";
  marked_by_teacher_id?: number;
}

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

// ─── Fetch attendance by date ──────────────────────────────────────────
export const fetchAttendanceByDate = async (
  date: string
): Promise<AttendanceRecord[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/attendance/date/${date}`,
      { withCredentials: true }
    );
    const raw = response.data?.data ?? response.data ?? [];
    return raw.map((item: any) => ({
      ...item,
      student_id: item.student_id ?? item.student?.id ?? null,
    }));
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
  const response = await apiClient.get(
    `/api/v1/attendance/class/${classNo}/date/${date}`,
    { withCredentials: true }
  );
  const raw = response.data?.data ?? response.data ?? [];
  return raw.map((item: any) => ({
    ...item,
    student_id: item.student_id ?? item.student?.id ?? null,
  }));
};

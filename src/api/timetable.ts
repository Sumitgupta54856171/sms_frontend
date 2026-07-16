import apiClient from "./client";
import { getCookie } from "@/lib/utils";

export interface PeriodEntry {
  id?: number;
  gradeClass: string;
  subjectName: string;
  periodNumber: number;
  teacher_id: number | string;
  teacher_name?: string;
  session_id?: number;
}

export interface TimetableEntry {
  id?: number;
  gradeClass: string;
  periods: PeriodEntry[];
}

export interface ClassTeacher {
  id?: number;
  gradeClass?: string;
  class_no?: string;
  section?: string;
  teacher_id: number | string;
  teacher_name?: string;
}

// ─── Fetch all timetable records ───────────────────────────────────────
export const fetchAllTimetables = async (): Promise<PeriodEntry[]> => {
  const response = await apiClient.get("/api/v1/academic-options/time-table/all", {
    withCredentials: true,
  });
  const raw = response.data?.data ?? response.data ?? [];
  return raw.map((item: any) => ({
    ...item,
    teacher_id: item.teacher_id ?? item.teacher?.id ?? null,
    teacher_name: item.teacher?.fullName ?? item.teacher_name,
  }));
};

// ─── Fetch timetable by grade ──────────────────────────────────────────
export const fetchTimetableByGrade = async (
  gradeClass: string
): Promise<PeriodEntry[]> => {
  const response = await apiClient.get(`/api/v1/academic-options/time-table/grade/${gradeClass}`, {
    withCredentials: true,
  });
  const raw = response.data?.data ?? response.data ?? [];
  return raw.map((item: any) => ({
    ...item,
    teacher_id: item.teacher_id ?? item.teacher?.id ?? null,
    teacher_name: item.teacher?.fullName ?? item.teacher_name,
  }));
};

// ─── Save/update a timetable record ────────────────────────────────────
export const savePeriod = async (data: PeriodEntry): Promise<any> => {
    console.log(data)
  const response = await apiClient.post("/api/v1/academic-options/time-table/period", data, {
    withCredentials: true,
  });
  
  return response.data;
};

// ─── Delete a timetable record ─────────────────────────────────────────
export const deletePeriod = async (timetableId: number): Promise<any> => {
  const response = await apiClient.delete(`/api/v1/academic-options/delete/period/${timetableId}`, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Fetch timetable for a specific teacher ────────────────────────────
export const fetchTimetableByTeacher = async (
  teacherId: number | string
): Promise<PeriodEntry[]> => {
  const response = await apiClient.get(`/api/v1/academic-options/time-table/teacher/${teacherId}`, {
    withCredentials: true,
  });
  const raw = response.data?.data ?? response.data ?? [];
  return raw.map((item: any) => ({
    ...item,
    teacher_id: item.teacher_id ?? item.teacher?.id ?? null,
    teacher_name: item.teacher?.fullName ?? item.teacher_name,
  }));
};

// ─── Fetch my own timetable (uses JWT token) ───────────────────────────
export const fetchMyTimetable = async (teacherId?: number | string): Promise<PeriodEntry[]> => {
  const tid = teacherId ?? getCookie("teacherId");
  const id = Number(tid);
  const response = await apiClient.get(`/api/v1/academic-options/time-table/teacher/${id}`, {
    withCredentials: true,
  });
  const raw = response.data?.data ?? response.data ?? [];
  return raw.map((item: any) => ({
    ...item,
    teacher_id: item.teacher_id ?? item.teacher?.id ?? null,
    teacher_name: item.teacher?.fullName ?? item.teacher_name,
  }));
};

// ─── Assign class teacher ──────────────────────────────────────────────
export const assignClassTeacher = async (data: ClassTeacher): Promise<any> => {
  const response = await apiClient.post("/api/v1/academic-options/timetable/class-teacher", data, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Fetch all class teachers ──────────────────────────────────────────
export const fetchAllClassTeachers = async (): Promise<ClassTeacher[]> => {
  try {
    const response = await apiClient.get("/api/v1/academic-options/timetable/class-teachers/all", {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data ?? [];
    return raw.map((item: any) => ({
      id: item.id,
      gradeClass: item.gradeClass,
      class_no: item.class_no ?? item.gradeClass,
      section: item.section,
      teacher_id: item.teacher?.id ?? item.teacher_id,
      teacher_name: item.teacher?.fullName ?? item.teacher_name,
    }));
  } catch (error) {
    console.warn("Failed to fetch class teachers:", error);
    return [];
  }
};

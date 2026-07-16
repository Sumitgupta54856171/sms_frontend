import apiClient from "./client";

export interface TeacherPlan {
  id?: number;
  chapter: string;
  topic: string;
  description: string;
  date: string;
  classNo: string;
  teacherId: number;
  period?: number;
}

export interface TeacherPlanResponse {
  id: number;
  chapter: string;
  topic: string;
  description: string;
  date: string;
  classNo: string;
  teacherId: number;
  teacherName?: string;
  period?: number;
  sessionId?: number;
}

// ─── Fetch plans by date and teacher ──────────────────────────────────
export const fetchPlansByDateAndTeacher = async (
  date: string,
  teacherId: number
): Promise<TeacherPlanResponse[]> => {
  try {
    const response = await apiClient.get(`/api/v1/teachers/plan/${date}/${teacherId}`, {
      withCredentials: true,
    });
    const raw = response.data?.body ?? response.data;
    // Handle both single object and array responses
    const arr = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
    // Map backend response: flatten nested teacher object, convert period to number
    return arr.map((item: any) => ({
      id: item.id,
      chapter: item.chapter,
      topic: item.topic,
      description: item.description,
      date: item.date,
      classNo: item.classNo,
      teacherId: item.teacher?.id ?? item.teacherId ?? teacherId,
      teacherName: item.teacher?.fullName ?? item.teacherName,
      period: item.period != null ? Number(item.period) : undefined,
      sessionId: item.sessionId,
    }));
  } catch {
    return [];
  }
};

// ─── Save a new teacher plan ──────────────────────────────────────────
export const saveTeacherPlan = async (data: TeacherPlan): Promise<any> => {
  const response = await apiClient.post("/api/v1/teachers/teacher/plan/save", data, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Update a teacher plan ────────────────────────────────────────────
export const updateTeacherPlan = async (
  id: number,
  data: Partial<TeacherPlan>
): Promise<any> => {
  const response = await apiClient.put("/api/v1/teachers/teacher/plan/update", { ...data, id }, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Delete a teacher plan ────────────────────────────────────────────
export const deleteTeacherPlan = async (id: number): Promise<any> => {
  const response = await apiClient.delete(`/api/v1/teachers/teacher/plan/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

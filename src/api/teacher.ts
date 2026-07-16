import apiClient from "./client";

export interface TeacherData {
  fullName: string;
  email: string;
  employee_id: string;
  phone?: string;
  subject_specialization?: string;
  gender?: string;
  aadhaar_id?: string;
  sssmid?: string;
  status?: string;
  password?: string;
  education?: string;
  createdAt?:any;
  updateAt?:any;
}

export interface TeacherResponse {
  id: number;
  fullName: string;
  name?: string;
  email: string;
  employee_id: string;
  phone?: string;
  subject_specialization?: string;
  gender?: string;
  aadhaar_id?: string;
  sssmid?: string;
  status: string;
  created_at?: string;
}

export const fetchTeachers = async (): Promise<TeacherResponse[]> => {
  const response = await apiClient.get("/api/v1/teachers/all");
  const raw = response.data?.data ?? response.data ?? [];
  return raw.map((t: any) => ({
    ...t,
    id: t.id ?? t.teacher_id,
    fullName: t.fullName ?? t.name,
  }));
};

export const saveTeacher = async (data: TeacherData) => {
  const response = await apiClient.post("/api/v1/teachers/save", data);
  return response.data;
};

export const updateTeacher = async (id: string, data: Partial<TeacherData>) => {
  const response = await apiClient.put("/api/v1/teachers/update", { ...data, id });
  return response.data;
};

export const deleteTeacher = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/teachers/${id}`);
  return response.data;
};

export interface ChangeRoleData {
  email: string;
  password: string;
  role: "ADMIN" | "ACCOUNTANT" | "TEACHER";
}

export const changeTeacherRole = async (data: ChangeRoleData) => {
  const response = await apiClient.post("/api/v1/teachers/change-role", data);
  return response.data;
};

// ─── Fetch teacher's assigned class (for class teacher role) ───────────
// GET /api/v1/teachers/get/teacher/class → returns { className: "Grade 1" } or similar
export const fetchTeacherClass = async (): Promise<string> => {
  const response = await apiClient.get("/api/v1/teachers/get/teacher/class", {
    withCredentials: true,
  });
  console.log("Teacher class response:", response.data);
  
  const raw = response.data?.className ?? response.data?.data ?? response.data ?? "";
  return typeof raw === "string" ? raw : "";
};

// ─── Fetch teacher class and cache in localStorage ────────────────────
export const fetchAndCacheTeacherClass = async (): Promise<string> => {
  try {
    const className = await fetchTeacherClass();
    if (className) {
      localStorage.setItem("className", className);
    }
    return className;
  } catch {
    return localStorage.getItem("className") || "";
  }
};

// ─── Teacher Photo Upload ─────────────────────────────────────────────
export const uploadTeacherPhoto = async (teacherId: number, file: File) => {
  const formData = new FormData();
  formData.append("teacherId", String(teacherId));
  formData.append("photo", file);
  const response = await apiClient.post("/api/v1/teachers/photo/upload", formData, {
    withCredentials: true,
    transformRequest: [(data) => data],
    headers: { "Content-Type": null },
  });
  return response.data;
};

export const fetchTeacherPhoto = async (teacherId: number): Promise<{ id: number; filePath: string } | null> => {
  const response = await apiClient.get(`/api/v1/teachers/photo/${teacherId}`, {
    withCredentials: true,
  });
  return response.data?.data ?? response.data ?? null;
};

export const getTeacherPhotoBlobUrl = async (filePath: string): Promise<string> => {
  const response = await apiClient.get(`/${filePath}`, {
    withCredentials: true,
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
};

export const deleteTeacherPhoto = async (teacherId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/teachers/photo/delete/${teacherId}`, {
    withCredentials: true,
  });
};

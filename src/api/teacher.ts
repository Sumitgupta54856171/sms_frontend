import apiClient from "./client";

export interface TeacherData {
  name: string;
  email: string;
  employee_id: string;
  phone?: string;
  subject_specialization?: string;
  gender?: string;
  aadhaar_id?: string;
  sssmid?: string;
  status?: string;
  password?: string;
  createdAt?:any;
  updateAt?:any;
}

export interface TeacherResponse {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  phone?: string;
  subject_specialization?: string;
  gender?: string;
  aadhaar_id?: string;
  sssmid?: string;
  status: string;
  created_at: string;
}

export const fetchTeachers = async (): Promise<TeacherResponse[]> => {
  const response = await apiClient.get("/api/v1/teachers/all");
  console.log(response.data)
  return response.data;
};

export const saveTeacher = async (data: TeacherData) => {
  const response = await apiClient.post("/api/v1/teachers/save", data);
  return response.data;
};

export const updateTeacher = async (id: string, data: Partial<TeacherData>) => {
  const response = await apiClient.put(`/api/v1/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/teachers/${id}`);
  return response.data;
};

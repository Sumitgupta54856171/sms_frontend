import apiClient from "./client";

export interface StudentData {
  name: string;
  email: string;
  class_id?: string;
  section?: string;
  roll_no?: string;
  scholar_no?: string;
  sssmid?: string;
  aadhaar?: string;
  gender?: string;
  category?: string;
  dob?: string;
  phone?: string;
  father_name?: string;
  mother_name?: string;
  status?: string;
}

export interface StudentResponse {
  id: string;
  name: string;
  email: string;
  classInfo?: string;
  roll?: string;
  parent?: string;
  status: string;
  [key: string]: any;
}

export const fetchStudents = async (): Promise<StudentResponse[]> => {
  const response = await apiClient.get("/api/v1/students/all");
  return response.data;
};

export const saveStudent = async (data: StudentData) => {
  const response = await apiClient.post("/api/v1/students/save", data);
  return response.data;
};

export const updateStudent = async (id: string, data: Partial<StudentData>) => {
  const response = await apiClient.put(`/api/v1/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/students/${id}`);
  return response.data;
};

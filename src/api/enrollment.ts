import apiClient from "./client";

export interface EnrollmentRequest {
  classNo: string;
  rolNo: string;
  studentId: number;
  Totalfees: number;
}

export interface EnrollmentResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const saveEnrollment = async (data: EnrollmentRequest[]) => {
  console.log("Enrollment data:", data);
  const response = await apiClient.post("/api/v1/students/promote", data, {
    withCredentials: true,
  });
  console.log("Enrollment response:", response.data);
  return response.data;
};

export const fetchEnrolledStudents = async (classNo: string) => {
  const response = await apiClient.get(`/api/v1/enrollment/class/${classNo}`, {
    withCredentials: true,
  });
  return response.data;
};

/** Fetch enrollment record for a single student by student ID */
export const fetchEnrollmentByStudentId = async (studentId: number) => {
  const response = await apiClient.get(`/api/v1/enrollment/student/${studentId}`, {
    withCredentials: true,
  });
  return response.data;
};

/** Fetch class and roll number for a student — uses /api/v1/class/roll/no/{studentId} */
export const fetchStudentClassAndRoll = async (studentId: number) => {
  const response = await apiClient.get(`/api/v1/students/class/roll/no/${studentId}`, {
    withCredentials: true,
  });
  console.log(`Class and roll for student ${studentId}:`, response.data);
  return response.data.body;
};

/** Fetch class-wise enrollment data for dashboard — uses /api/v1/dashboard/get/enrollment/class */
export const fetchEnrollmentByClass = async () => {
  const response = await apiClient.get("/api/v1/dashoard/get/enrollment/class", {
    withCredentials: true,
  });
  console.log("Enrollment by class response:", response.data);
  // Response shape: { headers: {}, body: ["6", "6", "9"], statusCode: "OK", statusCodeValue: 200 }
  const raw = response.data?.body ?? response.data;
  return Array.isArray(raw) ? raw : [];
};

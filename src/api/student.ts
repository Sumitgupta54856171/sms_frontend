import apiClient from "./client";

export interface StudentData {
  name: string;
  email: string;
  class_no?: string;
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
  total_fees?: string;
}

export interface StudentEnrollment {
  enrollmentId: number;
  class_no: string;
  roll_no: string;
  session: any;
  sessionIdInEnrollment: number | null;
  student: {
    id: number;
    name: string;
    email: string;
    aadhaar: string;
    category: string;
    createdAt: string;
    dob: string;
    father_name: string;
    gender: string;
    mother_name: string;
    phone: string;
    scholar_no: string;
    sssmid: string;
    status: string;
    updatedAt: string;
  };
  studentId: number | null;
}

export interface StudentRecord {
  id: number;
  enrollment: StudentEnrollment[];
}

export interface StudentResponse {
  id: number;
  name: string;
  email: string;
  classInfo?: string;
  roll?: string;
  parent?: string;
  status: string;
  // Full nested data for profile
  enrollment?: StudentEnrollment[];
  studentRaw?: StudentEnrollment['student'];
  [key: string]: any;
}

export const fetchStudents = async (): Promise<StudentResponse[]> => {
  const response = await apiClient.get("/api/v1/students/all", { withCredentials: true });
  console.log("API response:", response.data);

  // Backend returns { data: Array(1), success: "student fetched successfully" }
  const rawData: StudentRecord[] = response.data?.data ?? response.data ?? [];

  // Map nested structure to flat table format
  return rawData.map((record: StudentRecord) => {
    const enrollment = record.enrollment?.[0];
    const student = enrollment?.student;

    return {
      id: student?.id ?? record.id,
      name: student?.name ?? "",
      email: student?.email ?? "",
      classInfo: enrollment?.class_no ? `Grade ${enrollment.class_no}` : "-",
      roll: enrollment?.roll_no ?? "-",
      parent: student?.father_name ?? "-",
      status: student?.status === "active" ? "Active" : "Inactive",
      // Keep full data for profile view
      enrollment: record.enrollment,
      studentRaw: student,
      scholar_no: student?.scholar_no,
      sssmid: student?.sssmid,
      aadhaar: student?.aadhaar,
      gender: student?.gender,
      category: student?.category,
      dob: student?.dob,
      phone: student?.phone,
      mother_name: student?.mother_name,
      father_name: student?.father_name,
    };
  });
};

export const saveStudent = async (data: StudentData) => {
  const response = await apiClient.post("/api/v1/students/save", data,{withCredentials:true});
  return response.data;
};

export const updateStudent = async (id: string, data: Partial<StudentData>) => {
  const response = await apiClient.put(`/api/v1/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/students/delete/${id}`);
  return response.data;
};

// ─── Upload student photo ──────────────────────────────────────────────
export const uploadStudentPhoto = async (studentId: number, file: File) => {
  const formData = new FormData();
  formData.append("studentId", String(studentId));
  formData.append("photo", file);
  const response = await apiClient.post("/api/v1/students/photo/upload", formData, {
    withCredentials: true,
    transformRequest: [(data) => data],
    headers: { "Content-Type": null },
  });
  return response.data;
};

// ─── Fetch student photo ───────────────────────────────────────────────
export const fetchStudentPhoto = async (studentId: number): Promise<{ id: number; filePath: string } | null> => {
  const response = await apiClient.get(`/api/v1/students/photo/${studentId}`, {
    withCredentials: true,
  });
  console.log("Fetched student photo blob:", response.data);
  return response.data?.data ?? response.data ?? null;
};

/** Fetch the actual photo image as a blob (with auth) and return an object URL. */
export const getPhotoBlobUrl = async (filePath: string): Promise<string> => {
  const response = await apiClient.get(`/${filePath}`, {
    withCredentials: true,
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
};

// ─── Save student bank details ─────────────────────────────────────────
export interface BankDetailsPayload {
  studentId: number;
  accountHolder: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
}

export interface BankDetailsResponse {
  studentId: number;
  accountHolder: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
}

export const saveBankDetails = async (data: BankDetailsPayload) => {
  const response = await apiClient.post("/api/v1/students/bank-details", data, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchBankDetails = async (studentId: number): Promise<BankDetailsResponse> => {
  const response = await apiClient.get(`/api/v1/students/bank-details/${studentId}`, {
    withCredentials: true,
  });
  console.log("Fetched bank details:", response.data);
  return response.data?.data ?? response.data;
};

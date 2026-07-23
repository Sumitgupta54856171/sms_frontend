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
  apaarId?: string;
  penId?: string;
  address?: string;
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
  // Full nested data for profile view
  enrollment?: StudentEnrollment[];
  studentRaw?: StudentEnrollment['student'];
  [key: string]: any;
}

/** Fetch students by class number — uses /api/v1/students/class/{classNo} */
export const fetchStudentsByClass = async (classNo: string) => {
  console.log(
    'check the tuype of classNo in fetchStudentsByClass:', typeof classNo, classNo
  )
  const response = await apiClient.get(`/api/v1/students/class/v1/${classNo}`, {
    withCredentials: true,
  });
  console.log("Fetched students by class:", response.data);
  return response.data; // { studentdetail: [...], classteacherName: "...", success: "..." }
};

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

// ─── Student list item from /api/v1/students/studentlist ───────────────
export interface StudentListItem {
  StudentName: string;
  studentId: number;
  scholarNo: string;
  faterhName: string;
  motherName: string;
  status: string;
  className?: string;
  class_no?: string;
}

// ─── Fetch student list (new API) ──────────────────────────────────────
export const fetchStudentList = async (): Promise<StudentListItem[]> => {
  const response = await apiClient.get("/api/v1/students/studentlist", {
    withCredentials: true,
  });
  console.log("Student list response:", response.data);
  return response.data?.body ?? response.data ?? [];
};

// ─── Fetch full student detail by ID ───────────────────────────────────
export interface StudentDetail {
  id: number;
  name: string;
  email: string;
  scholar_no: string;
  sssmid: string;
  aadhaar: string;
  gender: string;
  category: string;
  dob: string;
  phone: string;
  father_name: string;
  mother_name: string;
  status: string;
  apaarId: string;
  penId: string;
  address: string;
  createdAt: string;
  class_no?: string;
  roll_no?: string;
  enrollment?: Array<{ class_no?: string; roll_no?: string }>;
}

export interface BankDetailData {
  bankDetailId?: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  AccountHolderName: string;
  branchName: string;
}

export interface PhotoData {
  id?: number;
  fileName?: string;
  contentType?: string;
  filePath?: string;
  fileSize?: number;
}

export interface StudentDetailResponse {
  student: StudentDetail | null;
  bank: BankDetailData | null;
  photo: PhotoData | null;
  enrollment?: Array<{ class_no?: string; roll_no?: string }>;
}

export const fetchStudentDetail = async (studentId: number): Promise<StudentDetailResponse | null> => {
  try {
    const response = await apiClient.get(`/api/v1/students/student-detail/${studentId}`, {
      withCredentials: true,
    });
    console.log("Student detail response:", response.data);
    const data = response.data?.body ?? response.data?.data ?? response.data ?? null;
    if (!data) return null;
    return {
      student: data.student ?? null,
      bank: data.bank ?? null,
      photo: data.photo ?? null,
      enrollment: data.enrollment ?? data.student?.enrollment ?? [],
    };
  } catch {
    return null;
  }
};

// ─── Update student detail ─────────────────────────────────────────────
export const updateStudentDetail = async (data: Partial<StudentDetail> & { id: number }) => {
  const response = await apiClient.put("/api/v1/students/update/student-detail", data, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Update bank detail ────────────────────────────────────────────────
export const updateBankDetail = async (data: {
  studentId: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  AccountHolderName: string;
  branchName: string;
}) => {
  const response = await apiClient.put("/api/v1/students/update/student/bank-detail", data, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Update student photo ──────────────────────────────────────────────
export const updateStudentPhoto = async (studentId: number, file: File) => {
  const formData = new FormData();
  formData.append("studentId", String(studentId));
  formData.append("photo", file);
  const response = await apiClient.put("/update/student/photo", formData, {
    withCredentials: true,
    transformRequest: [(data) => data],
    headers: { "Content-Type": null },
  });
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

// ─── Delete student photo ──────────────────────────────────────────────
export const deleteStudentPhoto = async (studentId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/students/photo/delete/${studentId}`, {
    withCredentials: true,
  });
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
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  AccountHolderName: string;
  branchName: string;
}

export interface BankDetailsResponse {
  studentId?: number;
  accountHolderName?: string;
  AccountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  bankDetailId?: number;
  student?: any;
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
  return response.data?.data ?? response.data ;
};

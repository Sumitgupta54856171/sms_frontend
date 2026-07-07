import apiClient from "./client";

export interface FeeHead {
  name: string;
  code: string;
  amount: number;
  isOptional?: boolean;
}

export interface FeeStructure {
  classRange: string;
  classes: string[];
  annualTotal: number;
  heads: FeeHead[];
}

// ─── Payment / History types ───────────────────────────────────────────
export interface FeePayment {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  session: string;
  amount: number;
  paymentDate: string;
  paymentMode: "cash" | "cheque" | "online" | "dd";
  receiptNo: string;
  feeHead: string;
  remarks?: string;
}

export interface FeeSummary {
  studentId: number;
  studentName: string;
  className: string;
  session: string;
  annualFee: number;
  totalPaid: number;
  totalDue: number;
  payments: FeePayment[];
}

export interface PayFeePayload {
  studentId: number;
  amount: number;
  paymentMode: "cash" | "cheque" | "online" | "dd";
  feeHead: string;
  session: string;
  remarks?: string;
}

// ─── Fee structure definitions by class range ─────────────────────────
export const FEE_STRUCTURES: FeeStructure[] = [
  {
    classRange: "Nursery - UKG",
    classes: ["Nursery", "LKG", "UKG"],
    annualTotal: 12000,
    heads: [
      { name: "Tuition Fee", code: "TUI", amount: 6000 },
      { name: "Admission Fee", code: "ADM", amount: 1500 },
      { name: "Development Fee", code: "DEV", amount: 1200 },
      { name: "Library Fee", code: "LIB", amount: 800 },
      { name: "Sports Fee", code: "SPO", amount: 600 },
      { name: "Arts & Craft Fee", code: "ART", amount: 500 },
      { name: "Medical Checkup", code: "MED", amount: 400 },
      { name: "Miscellaneous", code: "MISC", amount: 1000 },
    ],
  },
  {
    classRange: "Grade 1 - 5",
    classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
    annualTotal: 15000,
    heads: [
      { name: "Tuition Fee", code: "TUI", amount: 7500 },
      { name: "Admission Fee", code: "ADM", amount: 1500 },
      { name: "Development Fee", code: "DEV", amount: 1500 },
      { name: "Library Fee", code: "LIB", amount: 1000 },
      { name: "Sports Fee", code: "SPO", amount: 800 },
      { name: "Computer Lab Fee", code: "COM", amount: 1000 },
      { name: "Medical Checkup", code: "MED", amount: 500 },
      { name: "Miscellaneous", code: "MISC", amount: 1200 },
    ],
  },
  {
    classRange: "Grade 6 - 8",
    classes: ["Grade 6", "Grade 7", "Grade 8"],
    annualTotal: 18000,
    heads: [
      { name: "Tuition Fee", code: "TUI", amount: 9000 },
      { name: "Admission Fee", code: "ADM", amount: 1500 },
      { name: "Development Fee", code: "DEV", amount: 1800 },
      { name: "Library Fee", code: "LIB", amount: 1200 },
      { name: "Sports Fee", code: "SPO", amount: 1000 },
      { name: "Computer Lab Fee", code: "COM", amount: 1200 },
      { name: "Science Lab Fee", code: "SCI", amount: 1000 },
      { name: "Medical Checkup", code: "MED", amount: 500 },
      { name: "Miscellaneous", code: "MISC", amount: 800 },
    ],
  },
  {
    classRange: "Grade 9 - 10",
    classes: ["Grade 9", "Grade 10"],
    annualTotal: 22000,
    heads: [
      { name: "Tuition Fee", code: "TUI", amount: 11000 },
      { name: "Admission Fee", code: "ADM", amount: 2000 },
      { name: "Development Fee", code: "DEV", amount: 2000 },
      { name: "Library Fee", code: "LIB", amount: 1500 },
      { name: "Sports Fee", code: "SPO", amount: 1000 },
      { name: "Computer Lab Fee", code: "COM", amount: 1500 },
      { name: "Science Lab Fee", code: "SCI", amount: 1500 },
      { name: "Medical Checkup", code: "MED", amount: 500 },
      { name: "Miscellaneous", code: "MISC", amount: 1000 },
    ],
  },
  {
    classRange: "Grade 11 - 12",
    classes: ["Grade 11", "Grade 12"],
    annualTotal: 28000,
    heads: [
      { name: "Tuition Fee", code: "TUI", amount: 14000 },
      { name: "Admission Fee", code: "ADM", amount: 2500 },
      { name: "Development Fee", code: "DEV", amount: 2500 },
      { name: "Library Fee", code: "LIB", amount: 1500 },
      { name: "Sports Fee", code: "SPO", amount: 1000 },
      { name: "Computer Lab Fee", code: "COM", amount: 2000 },
      { name: "Science Lab Fee", code: "SCI", amount: 2000 },
      { name: "Medical Checkup", code: "MED", amount: 500 },
      { name: "Miscellaneous", code: "MISC", amount: 1000 },
    ],
  },
];

// ─── Helper to get fee structure for a class ───────────────────────────
export const getFeeStructureForClass = (className: string): FeeStructure | undefined => {
  return FEE_STRUCTURES.find((f) => f.classes.includes(className));
};

// ─── Fetch fee structures from backend (optional) ──────────────────────
export const fetchFeeStructures = async (): Promise<any> => {
  try {
    const response = await apiClient.get("/api/v1/fees/structures", {
      withCredentials: true,
    });
    return response.data;
  } catch {
    return FEE_STRUCTURES;
  }
};

// ─── Fetch students by class for fee management ────────────────────────
export const fetchStudentsByClass = async (className: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/api/v1/students/class/${className}`, {
      withCredentials: true,
    });
    const raw = response.data?.data ?? response.data ?? [];
    console.log("check raw data", raw);

    return raw.map((item: any) => {
      // Each item IS the enrollment record with a nested `student` object
      const studentObj = item.student ?? item;

      console.log("mapping item:", { studentObj, item });
      console.log("check the enrollmentId", item.enrollmentId);

      return {
        id: studentObj.id ?? item.id,
        name: studentObj.name ?? "",
        scholarNo: studentObj.scholar_no ?? "-",
        rollNo: item.roll_no ?? "-",
        className: className,
        parent: studentObj.father_name ?? "-",
        phone: studentObj.phone ?? "-",
        status: studentObj.status ?? "active",
        total_fees: item.total_fees,
        enrollmentId: item.enrollmentId
      };
    });
  } catch {
    return [];
  }
};

// ─── Fetch total annual fees for a student ────────────────────────────
export const fetchStudentAnnualFees = async (studentId: number): Promise<number> => {
  try {
    const response = await apiClient.get(`/api/v1/fee/student/fees/${studentId}`, {
      withCredentials: true,
    });
    
    const data = response.data?.body[0] ?? response.data;
    

    return data?.feesAmount ?? data?.annualFee ?? data?.annualTotal ?? data ?? 0;
  } catch {
    return 0;
  }
};

// ─── Fetch fee summary for a student (all sessions) ────────────────────
export const fetchStudentFeeSummary = async (studentId: number): Promise<FeeSummary | null> => {
  try {
    const response = await apiClient.get(`/api/v1/fees/student/${studentId}/summary`, {
      withCredentials: true,
    });
    return response.data?.data ?? response.data ?? null;
  } catch {
    return null;
  }
};

// ─── Fetch payment history for a student in a session ──────────────────
export const fetchPaymentHistory = async (
  studentId: number,
  session: string
): Promise<FeePayment[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/fees/student/${studentId}/session/${session}`,
      { withCredentials: true }
    );
    const raw = response.data?.data ?? response.data ?? [];
    return raw.map((item: any) => ({
      id: item.id,
      studentId: item.studentId,
      studentName: item.studentName ?? "",
      className: item.className ?? "",
      session: item.session ?? session,
      amount: item.amount ?? 0,
      paymentDate: item.paymentDate ?? item.date ?? "",
      paymentMode: item.paymentMode ?? "cash",
      receiptNo: item.receiptNo ?? item.receipt_no ?? "-",
      feeHead: item.feeHead ?? item.fee_head ?? "General",
      remarks: item.remarks ?? "",
    }));
  } catch {
    return [];
  }
};

// ─── Record a fee payment ──────────────────────────────────────────────
export const recordFeePayment = async (payload: PayFeePayload): Promise<any> => {
  const response = await apiClient.post("/api/v1/fees/pay", payload, {
    withCredentials: true,
  });
  return response.data;
};

// ─── Invoice types ─────────────────────────────────────────────────────
export interface InvoicePayload {
  enrollmentId: number;
  paymentMethod: string;
  studentId: number;
  scholarNo: number | string;
  classNo: string;
  rollNo: string;
  sessionId: number;
  amount: number;
  paymentType: string;
  remarks?: string;
}

export interface InvoiceResponse {
  invoiceId: number;
  invoiceNo: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  studentId: number;
  scholarNo: number;
  classNo: string;
  rollNo: string;
  sessionId: number;
  remarks?: string;
  createdAt: string;
}

// ─── Create invoice (send to backend) ──────────────────────────────────
export const createInvoice = async (data: InvoicePayload): Promise<InvoiceResponse> => {
  const response = await apiClient.post("/api/v1/fee/student/fees/collection/invoice", data, {
    withCredentials: true,
  });
  console.log("check the invoice payload is ", data);
  console.log("Invoice creation response:", response.data);
  return response.data?.body ?? response.data;
};

// ─── Fetch invoice by ID (for re-printing) ─────────────────────────────
export const fetchInvoiceById = async (invoiceId: number): Promise<InvoiceResponse> => {
  const response = await apiClient.get(`/api/v1/invoice/${invoiceId}`, {
    withCredentials: true,
  });
  return response.data?.data ?? response.data;
};

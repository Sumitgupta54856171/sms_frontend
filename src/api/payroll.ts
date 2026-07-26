import apiClient from "./client";

export interface PayrollAttendanceRecord {
  id?: number;
  machineId: string;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "half_day" | "leave" | "holiday";
  workHours?: number;
  isLate?: boolean;
  teacherId?: number | null;
  staffId?: number | null;
  remarks?: string;
}

export interface StaffMapping {
  machineId: string;
  teacherId?: number | null;
  staffId?: number | null;
  name: string;
  department?: string;
  monthlySalary?: number;
}

export interface PayrollUploadPayload {
  records: PayrollAttendanceRecord[];
  mappings: StaffMapping[];
  month: string;
  year: number;
}

const PAYROLL_KEY = "payroll_records";
const MAPPINGS_KEY = "payroll_mappings";

export const fetchPayrollRecords = async (
  month: string,
  year: number
): Promise<PayrollAttendanceRecord[]> => {
  try {
    const response = await apiClient.get(
      `/api/v1/payroll/attendance?month=${month}&year=${year}`,
      { withCredentials: true }
    );
    return response.data?.body ?? response.data?.data ?? response.data ?? [];
  } catch {
    const saved = localStorage.getItem(PAYROLL_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

export const savePayrollRecords = async (
  records: PayrollAttendanceRecord[]
): Promise<PayrollAttendanceRecord[]> => {
  try {
    const response = await apiClient.post(
      "/api/v1/payroll/attendance/save",
      records,
      { withCredentials: true }
    );
    const data = response.data?.body ?? response.data ?? records;
    localStorage.setItem(PAYROLL_KEY, JSON.stringify(data));
    return data;
  } catch {
    localStorage.setItem(PAYROLL_KEY, JSON.stringify(records));
    return records;
  }
};

export const saveStaffMappings = async (
  mappings: StaffMapping[]
): Promise<StaffMapping[]> => {
  try {
    const response = await apiClient.post(
      "/api/v1/payroll/mappings/save",
      mappings,
      { withCredentials: true }
    );
    const data = response.data?.body ?? response.data ?? mappings;
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(data));
    return data;
  } catch {
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(mappings));
    return mappings;
  }
};

export const fetchStaffMappings = async (): Promise<StaffMapping[]> => {
  try {
    const response = await apiClient.get("/api/v1/payroll/mappings", {
      withCredentials: true,
    });
    return response.data?.body ?? response.data?.data ?? response.data ?? [];
  } catch {
    const saved = localStorage.getItem(MAPPINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

export const deletePayrollRecord = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/payroll/attendance/${id}`, {
      withCredentials: true,
    });
  } catch {
    const saved = localStorage.getItem(PAYROLL_KEY);
    if (saved) {
      const items = JSON.parse(saved).filter(
        (r: PayrollAttendanceRecord) => r.id !== id
      );
      localStorage.setItem(PAYROLL_KEY, JSON.stringify(items));
    }
  }
};

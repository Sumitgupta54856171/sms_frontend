import apiClient from "./client";

// ─── Payroll Attendance ───────────────────────────────────────────────

export interface PayrollAttendanceRecord {
  id?: number;
  machineId: string;
  employeeName?: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "Present" | "Absent" | "Halfday" | "Leave" | "Holiday";
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

// ─── Salary ───────────────────────────────────────────────────────────

export interface SalaryRecord {
  salaryId?: number;
  totalSalary: number;
  /** Backend entity uses @OneToOne @JoinColumn(name="teacherId") private Teacher teacher */
  teacher: { id: number };
  sessionId?: number;
  machineId: number;
}

// ─── Salary Slip ──────────────────────────────────────────────────────

export type PayrollStatus = "Paid" | "Unpaid" | "Partial";

export interface SalarySlipRecord {
  salayId?: number;
  salary: number;
  advancedpay?: number;
  teacherId: number;
  machineId?: number;
  status: PayrollStatus;
  /** Month (0-based, 0=January) — used for frontend filtering */
  month?: number;
  /** Year — used for frontend filtering */
  year?: number;
}

/** Map backend Salaryslip response (teacher object) to frontend format (teacherId). */
function mapSlipResponse(item: any): SalarySlipRecord {
  if (!item) return item;
  return {
    salayId: item.salayId,
    salary: item.salary,
    advancedpay: item.advancedpay,
    teacherId: item.teacher?.id ?? item.teacherId,
    machineId: item.machineId,
    status: item.status,
    month: item.month,
    year: item.year,
  };
}

// ═══════════════════════════════════════════════════════════════════════
//  ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch attendance records for a date range.
 * Maps to: GET /api/v1/payroll/attendance/date/{startDate}/{endDate}
 *
 * Maps backend entity field names to frontend field names:
 *   checkin   → checkIn
 *   checkout  → checkOut
 *   workhours → workHours
 *   Remarks   → remarks
 */
export const fetchPayrollRecords = async (
  startDate: string,
  endDate: string
): Promise<PayrollAttendanceRecord[]> => {
  const response = await apiClient.get(
    `/api/v1/payroll/attendance/date/${startDate}/${endDate}`,
    { withCredentials: true }
  );
  const raw: any[] = response.data?.body ?? response.data?.data ?? response.data ?? [];
  return raw.map((r: any) => ({
    id: r.payAttendanceID ?? r.id,
    machineId: String(r.machineId ?? ""),
    employeeName: r.employeeName,
    date: r.date ?? r.todaydate,
    checkIn: r.checkin ?? r.checkIn,
    checkOut: r.checkout ?? r.checkOut,
    status: r.status,
    workHours: r.workhours != null ? Number(r.workhours) : r.workHours,
    isLate: r.isLate,
    teacherId: r.teacher?.id ?? r.teacherId ?? null,
    staffId: r.staffId ?? null,
    remarks: r.Remarks ?? r.remarks,
  }));
};

/**
 * Save attendance records.
 * **Only records with a teacherId are sent to the backend.**
 * Maps to: POST /api/v1/payroll/attendance/save
 *
 * Transforms frontend field names to match the backend entity:
 *   checkIn   → checkin
 *   checkOut  → checkout
 *   workHours → workhours
 *   remarks   → Remarks
 *   teacherId → teacher (object with id)
 */
export const savePayrollRecords = async (
  records: PayrollAttendanceRecord[]
): Promise<PayrollAttendanceRecord[]> => {
  // ── Filter: only send records that have a teacherId ──
  const recordsWithTeacher = records.filter((r) => r.teacherId != null);

  if (recordsWithTeacher.length === 0) {
    throw new Error("Cannot save attendance: no records have a teacher assigned. Map employees to teachers first.");
  }

  // ── Map frontend field names to backend entity field names ──
  const backendPayload = recordsWithTeacher.map((r) => ({
    machineId: Number(r.machineId),
    date: r.date,
    checkin: r.checkIn,
    checkout: r.checkOut,
    status: r.status,
    workhours: r.workHours != null ? String(r.workHours) : undefined,
    Remarks: r.remarks,
    teacher: r.teacherId != null ? { id: r.teacherId } : null,
  }));

  const response = await apiClient.post(
    "/api/v1/payroll/attendance/save",
    backendPayload,
    { withCredentials: true }
  );
  return response.data?.body ?? response.data ?? recordsWithTeacher;
};

/**
 * Update attendance records in bulk.
 * **Only records with a teacherId are sent to the backend.**
 * Maps to: PUT /api/v1/payroll/attendance/update
 *
 * Transforms frontend field names to match the backend entity:
 *   checkIn   → checkin
 *   checkOut  → checkout
 *   workHours → workhours
 *   remarks   → Remarks
 *   teacherId → teacher (object with id)
 */
export const updatePayrollRecords = async (
  records: PayrollAttendanceRecord[]
): Promise<PayrollAttendanceRecord[]> => {
  // ── Filter: only send records that have a teacherId ──
  const recordsWithTeacher = records.filter((r) => r.teacherId != null);

  if (recordsWithTeacher.length === 0) {
    throw new Error("Cannot update attendance: no records have a teacher assigned. Map employees to teachers first.");
  }

  // ── Map frontend field names to backend entity field names ──
  const backendPayload = recordsWithTeacher.map((r) => ({
    machineId: Number(r.machineId),
    date: r.date,
    checkin: r.checkIn,
    checkout: r.checkOut,
    status: r.status,
    workhours: r.workHours != null ? String(r.workHours) : undefined,
    Remarks: r.remarks,
    teacher: r.teacherId != null ? { id: r.teacherId } : null,
  }));

  const response = await apiClient.put(
    "/api/v1/payroll/attendance/update",
    backendPayload,
    { withCredentials: true }
  );
  return response.data?.body ?? response.data ?? recordsWithTeacher;
};

// ═══════════════════════════════════════════════════════════════════════
//  SALARY
// ═══════════════════════════════════════════════════════════════════════

/**
 * Save a teacher's monthly salary.
 * Maps to: POST /api/v1/payroll/salary/save
 */
export const saveSalary = async (salary: SalaryRecord): Promise<SalaryRecord> => {
  const response = await apiClient.post("/api/v1/payroll/salary/save", salary, {
    withCredentials: true,
  });
  return response.data?.body ?? response.data ?? salary;
};

/**
 * Get all salary records.
 * Maps to: GET /api/v1/payroll/salary/all
 */
export const fetchAllSalaries = async (): Promise<SalaryRecord[]> => {
  const response = await apiClient.get("/api/v1/payroll/salary/all", {
    withCredentials: true,
  });
  return response.data?.body ?? response.data?.data ?? response.data ?? [];
};

/**
 * Get a salary record by ID.
 * Maps to: GET /api/v1/payroll/salary/{id}
 */
export const fetchSalaryById = async (id: number): Promise<SalaryRecord> => {
  const response = await apiClient.get(`/api/v1/payroll/salary/${id}`, {
    withCredentials: true,
  });
  return response.data?.body ?? response.data;
};

// ═══════════════════════════════════════════════════════════════════════
//  SALARY SLIP
// ═══════════════════════════════════════════════════════════════════════

/**
 * Save salary slips (batch).
 * Maps to: POST /api/v1/payroll/salaryslip/save
 * Frontend uses teacherId, backend expects teacher: { id }
 */
export const saveSalarySlips = async (
  slips: SalarySlipRecord[]
): Promise<SalarySlipRecord[]> => {
  const payload = slips.map((s) => ({
    salayId: s.salayId,
    salary: s.salary,
    advancedpay: s.advancedpay,
    teacher: { id: s.teacherId },
    machineId: s.machineId,
    status: s.status,
    month: s.month,
    year: s.year,
  }));
  const response = await apiClient.post("/api/v1/payroll/salaryslip/save", payload, {
    withCredentials: true,
  });
  const data = response.data?.body ?? response.data ?? slips;
  // Map backend response back to frontend format
  return (Array.isArray(data) ? data : []).map(mapSlipResponse);
};

/**
 * Get all salary slips.
 * Maps to: GET /api/v1/payroll/salaryslip/all
 */
export const fetchAllSalarySlips = async (): Promise<SalarySlipRecord[]> => {
  const response = await apiClient.get("/api/v1/payroll/salaryslip/all", {
    withCredentials: true,
  });
  const data = response.data?.body ?? response.data?.data ?? response.data ?? [];
  return (Array.isArray(data) ? data : []).map(mapSlipResponse);
};

/**
 * Get a salary slip by ID.
 * Maps to: GET /api/v1/payroll/salaryslip/{id}
 */
export const fetchSalarySlipById = async (id: number): Promise<SalarySlipRecord> => {
  const response = await apiClient.get(`/api/v1/payroll/salaryslip/${id}`, {
    withCredentials: true,
  });
  return mapSlipResponse(response.data?.body ?? response.data);
};

/**
 * Update a single salary slip's status.
 * Maps to: PUT /api/v1/payroll/salaryslip/{id}/status
 */
export const updateSalarySlipStatus = async (
  id: number,
  status: PayrollStatus
): Promise<SalarySlipRecord> => {
  const response = await apiClient.put(
    `/api/v1/payroll/salaryslip/${id}/status`,
    { status },
    { withCredentials: true }
  );
  return mapSlipResponse(response.data?.body ?? response.data);
};

import React, { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Calendar,
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Save,
  Edit2,
  Search,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  UserPlus,
  Trash2,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  fetchPayrollRecords,
  savePayrollRecords,
  updatePayrollRecords,
  saveSalary,
  fetchAllSalaries,
  type PayrollAttendanceRecord,
  type StaffMapping,
  type SalaryRecord,
} from "@/api/payroll";
import { fetchTeachers } from "@/api/teacher";
import { useAppSelector } from "@/store/hooks";

interface ParsedRow {
  machineId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: PayrollAttendanceRecord["status"];
  workHours?: number;
}

interface TeacherOption {
  id: number;
  fullName: string;
  employee_id?: string;
}

const STATUS_OPTIONS = [
  { value: "Present", label: "Present", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "Absent", label: "Absent", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "Halfday", label: "Half Day", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "Leave", label: "Leave", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Holiday", label: "Holiday", color: "bg-slate-100 text-slate-700 border-slate-200" },
];

const LATE_THRESHOLD = "10:00";
const HALF_DAY_CHECKOUT_THRESHOLD = "14:40";

function getMonthName(monthIndex: number): string {
  return new Date(2024, monthIndex, 1).toLocaleString("default", { month: "long" });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function extractTimes(cell: string): string[] {
  if (!cell || cell.trim() === "") return [];
  const matches = cell.match(/(\d{2}:\d{2})/g);
  return matches ? matches : [];
}

function calculateWorkHours(checkIn: string, checkOut: string): number {
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  let diff = outH * 60 + outM - (inH * 60 + inM);
  if (diff < 0) diff += 24 * 60;
  return Math.round((diff / 60) * 100) / 100;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isCheckInLate(checkIn?: string): boolean {
  if (!checkIn) return false;
  return timeToMinutes(checkIn) >= timeToMinutes(LATE_THRESHOLD);
}

function isEarlyCheckout(checkOut?: string): boolean {
  if (!checkOut) return true;
  return timeToMinutes(checkOut) <= timeToMinutes(HALF_DAY_CHECKOUT_THRESHOLD);
}

function determineStatus(times: string[]): PayrollAttendanceRecord["status"] {
  if (times.length === 0) return "Absent";
  if (times.length === 1) return "Halfday";
  return "Present";
}

/**
 * Compute isLate — only true when status is NOT Halfday.
 * Halfday and late are mutually exclusive.
 */
function computeIsLate(checkIn?: string, status?: string): boolean {
  if (!checkIn || status === "Halfday") return false;
  return isCheckInLate(checkIn);
}

/**
 * Parse a Zkteco "Attendance Record Report" (CSV or XLS/XLSX).
 *
 * Expected layout:
 *   - One row contains "Att. Time" and the date range "YYYY-MM-DD ~ YYYY-MM-DD".
 *   - Next row has day numbers 1..N.
 *   - Then repeating employee blocks of TWO rows:
 *       Header: ID:,,{machineId},,,,,,Name:,,,,,,,,,,Dept.:,,Company
 *       Data:   time punches for day 1..N (each cell may contain concatenated HH:MM values)
 */
async function parseZktecoReport(file: File): Promise<ParsedRow[]> {
  let rawRows: string[][] = [];

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) {
    const text = await file.text();
    rawRows = text
      .split(/\r?\n/)
      .map((line) => line.split(",").map((c) => c.trim()));
  } else if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as string[][];
    rawRows = rawRows.map((r) => r.map((c) => (c === undefined || c === null ? "" : String(c).trim())));
  } else {
    throw new Error("Unsupported file type. Please upload .csv, .xls or .xlsx");
  }

  const rows = rawRows.filter((r) => r.some((c) => c !== ""));

  // ── Find the date range row ─────────────────────────────────────────
  let startDate: Date | null = null;
  let dateRangeRowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].join(" ");
    const match = rowText.match(/(\d{4})-(\d{2})-(\d{2})\s*~\s*(\d{4})-(\d{2})-(\d{2})/);
    if (match && rowText.includes("Att. Time")) {
      startDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      dateRangeRowIndex = i;
      break;
    }
  }

  if (!startDate) {
    throw new Error("Could not find 'Att. Time' date range in the uploaded file.");
  }

  // ── Find the day-numbers row ────────────────────────────────────────
  let dayCount = 0;
  let dayNumbersRowIndex = -1;

  for (let i = dateRangeRowIndex + 1; i < Math.min(rows.length, dateRangeRowIndex + 5); i++) {
    const row = rows[i];
    if (row[0] === "1" && row[1] === "2" && row[2] === "3") {
      dayNumbersRowIndex = i;
      for (let c = 0; c < row.length; c++) {
        if (row[c] && !isNaN(Number(row[c]))) dayCount++;
        else if (dayCount > 0) break;
      }
      break;
    }
  }

  if (dayCount === 0) dayCount = 10; // sensible fallback

  // ── Iterate employee blocks ─────────────────────────────────────────
  const parsed: ParsedRow[] = [];

  for (let i = dayNumbersRowIndex + 1; i < rows.length; i++) {
    const headerRow = rows[i];

    // Locate "ID:" marker and the machine id two cells after it
    const idMarkerIndex = headerRow.findIndex((c) => c === "ID:");
    if (idMarkerIndex === -1 || idMarkerIndex + 2 >= headerRow.length) continue;

    const machineId = headerRow[idMarkerIndex + 2];
    if (!machineId) continue;

    // Name is two cells after "Name:" marker if present
    const nameMarkerIndex = headerRow.findIndex((c) => c === "Name:");
    const employeeName =
      nameMarkerIndex !== -1 && nameMarkerIndex + 2 < headerRow.length
        ? headerRow[nameMarkerIndex + 2]
        : "";

    // The next row is the data row
    const dataRow = rows[i + 1];
    if (!dataRow) continue;

    for (let d = 0; d < dayCount; d++) {
      const cell = dataRow[d] || "";
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const dateKey = formatDateKey(date);

      const times = extractTimes(cell);
      const status = determineStatus(times);

      let checkIn: string | undefined;
      let checkOut: string | undefined;
      let workHours: number | undefined;

      if (times.length === 1) {
        checkIn = times[0];
      } else if (times.length >= 2) {
        checkIn = times[0];
        checkOut = times[times.length - 1];
        workHours = calculateWorkHours(checkIn, checkOut);
      }

      parsed.push({
        machineId,
        employeeName: employeeName || `Employee ${machineId}`,
        date: dateKey,
        checkIn,
        checkOut,
        status,
        workHours,
      });
    }

    i++; // skip the data row we just consumed
  }

  if (parsed.length === 0) {
    throw new Error("No employee attendance blocks found in the file.");
  }

  return parsed;
}

export default function PayrollView() {
  const now = new Date();
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [records, setRecords] = useState<PayrollAttendanceRecord[]>([]);
  const [mappings, setMappings] = useState<StaffMapping[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [search, setSearch] = useState("");
  const [editRecord, setEditRecord] = useState<PayrollAttendanceRecord | null>(null);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [savingMapping, setSavingMapping] = useState<string | null>(null);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [updatingAttendance, setUpdatingAttendance] = useState(false);
  const [savingHolidays, setSavingHolidays] = useState(false);
  const [holidayDates, setHolidayDates] = useState<Date[]>([]);
  // Local mapping edit state — prevents Select/Input from overriding each other
  const [localMappingEdits, setLocalMappingEdits] = useState<Record<string, { teacherId: number | null; monthlySalary: number }>>({});

  const daysInMonth = getDaysInMonth(year, month);
  const monthName = getMonthName(month);

  useEffect(() => {
    loadData();
    loadTeachers();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
      const [recs, salaryList] = await Promise.all([
        fetchPayrollRecords(startDate, endDate),
        fetchAllSalaries().catch(() => [] as SalaryRecord[]),
      ]);
      setRecords(
        recs.map((r) => ({
          ...r,
          isLate: computeIsLate(r.checkIn, r.status),
        }))
      );
      // Build mappings from backend salary records + merge with existing (file-uploaded) mappings
      if (salaryList.length > 0) {
        // First, create a mapping entry for every salary record from the backend
        const salaryMappings: StaffMapping[] = salaryList.map((s) => ({
          machineId: String(s.machineId),
          teacherId: s.teacher.id,
          staffId: null,
          name: `Employee ${s.machineId}`,
          monthlySalary: s.totalSalary,
        }));

        setMappings((prev) => {
          // If we already have mappings (from file upload), merge them — keep the names from uploads
          if (prev.length > 0) {
            const merged = [...prev];
            for (const sm of salaryMappings) {
              const existing = merged.find((m) => m.machineId === sm.machineId);
              if (!existing) {
                merged.push(sm);
              } else {
                // Update salary/teacher from backend if not set locally
                if (existing.teacherId == null) existing.teacherId = sm.teacherId;
                if (!existing.monthlySalary || existing.monthlySalary === 0) existing.monthlySalary = sm.monthlySalary;
              }
            }
            return merged;
          }
          // No existing mappings — use salary records as the base
          return salaryMappings;
        });
      }
    } catch {
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await fetchTeachers();
      setTeachers(
        data.map((t) => ({
          id: t.id,
          fullName: t.fullName ?? t.name ?? "",
          employee_id: t.employee_id,
        }))
      );
    } catch {
      toast.error("Failed to load teachers");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xls") && !name.endsWith(".xlsx") && !name.endsWith(".csv")) {
      toast.error("Please upload a Zkteco .csv, .xls or .xlsx report");
      return;
    }

    setParsing(true);
    try {
      const parsed = await parseZktecoReport(file);

      // Auto-create mappings for unknown machine IDs
      const existingMachineIds = new Set(mappings.map((m) => m.machineId));
      const newMappings: StaffMapping[] = [];
      const newRecords: PayrollAttendanceRecord[] = parsed.map((row) => {
        if (!existingMachineIds.has(row.machineId)) {
          newMappings.push({
            machineId: row.machineId,
            name: row.employeeName || `Employee ${row.machineId}`,
            teacherId: null,
            staffId: null,
            monthlySalary: 0,
          });
          existingMachineIds.add(row.machineId);
        }

        const mapping =
          mappings.find((m) => m.machineId === row.machineId) ||
          newMappings.find((m) => m.machineId === row.machineId);

        return {
          machineId: row.machineId,
          date: row.date,
          checkIn: row.checkIn,
          checkOut: row.checkOut,
          status: row.status,
          workHours: row.workHours,
          isLate: computeIsLate(row.checkIn, row.status),
          teacherId: mapping?.teacherId ?? null,
          staffId: mapping?.staffId ?? null,
          employeeName: row.employeeName,
        };
      });

      if (newMappings.length > 0) {
        setMappings((prev) => [...prev, ...newMappings]);
        toast.info(`${newMappings.length} new employee(s) detected. Please map them to teachers/staff.`);
        setIsMappingDialogOpen(true);
      }

      const merged = mergeRecords(records, newRecords);
      setRecords(merged);
      toast.success(`Imported ${newRecords.length} attendance records. Click "Save Attendance to Backend" to persist.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse file";
      toast.error(message);
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  };

  const mergeRecords = (
    existing: PayrollAttendanceRecord[],
    incoming: PayrollAttendanceRecord[]
  ): PayrollAttendanceRecord[] => {
    const map = new Map(existing.map((r) => [`${r.machineId}_${r.date}`, r]));
    incoming.forEach((r) => {
      const key = `${r.machineId}_${r.date}`;
      map.set(key, { ...map.get(key), ...r });
    });
    return Array.from(map.values());
  };

  const handleSaveMapping = async (machineId: string, teacherId: number | null, monthlySalary?: number) => {
    setSavingMapping(machineId);
    try {
      const updated = mappings.map((m) =>
        m.machineId === machineId
          ? { ...m, teacherId, staffId: teacherId ? null : m.staffId, monthlySalary }
          : m
      );
      setMappings(updated);

      const updatedRecords = records.map((r) =>
        r.machineId === machineId ? { ...r, teacherId } : r
      );
      setRecords(updatedRecords);

      // Save salary to backend if teacher is mapped and salary is set
      if (teacherId && monthlySalary && monthlySalary > 0) {
        await saveSalary({
          totalSalary: monthlySalary,
          teacher: { id: teacherId },
          sessionId: currentSession?.sessionId,
          machineId: Number(machineId),
        });
      }

      // Clear local edit for this row
      setLocalMappingEdits((prev) => {
        const next = { ...prev };
        delete next[machineId];
        return next;
      });

      toast.success("Mapping & salary saved to backend");
    } catch {
      toast.error("Failed to save mapping. Please try again.");
    } finally {
      setSavingMapping(null);
    }
  };

  const handleEditRecord = (record: PayrollAttendanceRecord) => {
    setEditRecord({ ...record });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editRecord) return;

    // Validate: teacherId is required to save to backend
    const mapping = mappings.find((m) => m.machineId === editRecord.machineId);
    if (!mapping?.teacherId) {
      toast.error("Please map this employee to a teacher first before saving attendance.");
      return;
    }

    const updatedRecord = {
      ...editRecord,
      teacherId: mapping.teacherId,
      isLate: computeIsLate(editRecord.checkIn, editRecord.status),
    };
    const updated = records.map((r) =>
      r.machineId === updatedRecord.machineId && r.date === updatedRecord.date ? updatedRecord : r
    );
    setRecords(updated);
    setIsEditDialogOpen(false);
    setEditRecord(null);
    toast.success("Attendance record updated locally. Click 'Save Attendance to Backend' to persist.");
  };

  const handleDeleteRecord = (record: PayrollAttendanceRecord) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const updated = records.filter(
      (r) => !(r.machineId === record.machineId && r.date === record.date)
    );
    setRecords(updated);
    toast.success("Record removed locally. Click 'Save Attendance to Backend' to persist.");
  };

  const handleAddMissingRecord = (machineId: string, date: string) => {
    setEditRecord({
      machineId,
      date,
      status: "Absent",
      teacherId: mappings.find((m) => m.machineId === machineId)?.teacherId ?? null,
    });
    setIsEditDialogOpen(true);
  };

  const uniqueMachineIds = useMemo(() => {
    const ids = new Set(records.map((r) => r.machineId));
    mappings.forEach((m) => ids.add(m.machineId));
    return Array.from(ids).sort();
  }, [records, mappings]);

  const filteredMachineIds = useMemo(() => {
    if (!search.trim()) return uniqueMachineIds;
    const q = search.toLowerCase();
    return uniqueMachineIds.filter((id) => {
      const mapping = mappings.find((m) => m.machineId === id);
      const name = mapping?.name?.toLowerCase() || "";
      const teacher = teachers.find((t) => t.id === mapping?.teacherId);
      return (
        id.toLowerCase().includes(q) ||
        name.includes(q) ||
        teacher?.fullName.toLowerCase().includes(q)
      );
    });
  }, [uniqueMachineIds, search, mappings, teachers]);

  const getRecordForDay = (machineId: string, day: number): PayrollAttendanceRecord | undefined => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return records.find((r) => r.machineId === machineId && r.date === dateKey);
  };

  const getMapping = (machineId: string): StaffMapping | undefined => {
    return mappings.find((m) => m.machineId === machineId);
  };

  const getTeacherName = (teacherId?: number | null): string => {
    if (!teacherId) return "—";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.fullName || "—";
  };

  const salarySummary = useMemo(() => {
    return filteredMachineIds.map((machineId) => {
      const mapping = getMapping(machineId);
      const monthlySalary = mapping?.monthlySalary ?? 0;
      const dailySalary = monthlySalary > 0 ? monthlySalary / daysInMonth : 0;

      const employeeRecords = records.filter((r) => r.machineId === machineId);
      const present = employeeRecords.filter((r) => r.status === "Present").length;
      const absent = employeeRecords.filter((r) => r.status === "Absent").length;
      const halfDay = employeeRecords.filter((r) => r.status === "Halfday").length;
      // Late count excludes Halfday records (mutually exclusive)
      const late = employeeRecords.filter((r) => r.isLate && r.status !== "Halfday").length;

      // 3 late days = 1 day salary cut
      const lateCutDays = Math.floor(late / 3);
      const lateCutAmount = lateCutDays * dailySalary;

      const absentCutAmount = absent * dailySalary;
      const halfDayCutAmount = halfDay * (dailySalary / 2);

      const totalCut = lateCutAmount + absentCutAmount + halfDayCutAmount;
      const netSalary = Math.max(0, monthlySalary - totalCut);

      return {
        machineId,
        teacherId: mapping?.teacherId ?? null,
        name: mapping?.name || `Employee ${machineId}`,
        monthlySalary,
        dailySalary,
        present,
        absent,
        halfDay,
        late,
        lateCutDays,
        lateCutAmount,
        absentCutAmount,
        halfDayCutAmount,
        totalCut,
        netSalary,
      };
    });
  }, [filteredMachineIds, records, mappings, daysInMonth]);

  const downloadTemplate = () => {
    const lines = [
      "Attendance Record Report,,,,,,,,,,,,,,,,,,,,",
      ",,,,,,,,,,,,,,,,,,,,",
      "Att. Time,,2026-07-01 ~ 2026-07-10,,,,,,,Tabulation,,2026-07-10,,,,,,,,,",
      "1,2,3,4,5,6,7,8,9,10,,,,,,,,,,,",
      "ID:,,1,,,,,,Name:,,John Doe,,,,,,,,,Dept.:,,Company",
      "09:5515:03,09:4615:00,11:0215:01,,,09:41,09:4315:01,09:4914:59,,09:43,,,,,,,,,,,",
    ];
    const csv = "\uFEFF" + lines.join("\n");
    downloadFile(csv, "zkteco_template.csv", "text/csv");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const headers = [
      "Machine ID",
      "Name",
      "Date",
      "Check In",
      "Check Out",
      "Status",
      "Late",
      "Work Hours",
      "Teacher",
    ];
    const rows = records.map((r) => {
      const mapping = getMapping(r.machineId);
      return [
        r.machineId,
        mapping?.name || r.employeeName || "",
        r.date,
        r.checkIn || "",
        r.checkOut || "",
        r.status,
        r.isLate ? "Yes" : "No",
        r.workHours || "",
        getTeacherName(r.teacherId),
      ];
    });
    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    downloadFile(csv, `payroll_${year}_${month + 1}.csv`, "text/csv");
  };

  const exportSalarySheet = () => {
    const headers = [
      "Machine ID",
      "Name",
      "Monthly Salary",
      "Present Days",
      "Absent Days",
      "Half Days",
      "Late Days",
      "Late Cut Days",
      "Total Cut",
      "Net Salary",
    ];
    const rows = salarySummary.map((s) => [
      s.machineId,
      s.name,
      s.monthlySalary,
      s.present,
      s.absent,
      s.halfDay,
      s.late,
      s.lateCutDays,
      s.totalCut.toFixed(2),
      s.netSalary.toFixed(2),
    ]);
    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    downloadFile(csv, `salary_${year}_${month + 1}.csv`, "text/csv");
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      // Only save records that have a teacherId (mapped employees)
      const recordsToSave = records.filter((r) => r.teacherId != null);

      if (recordsToSave.length === 0) {
        toast.error("No attendance records with mapped teachers to save. Map employees to teachers first.");
        return;
      }

      await savePayrollRecords(recordsToSave);
      toast.success(`Saved ${recordsToSave.length} attendance records to backend`);
    } catch {
      toast.error("Failed to save attendance records");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleUpdateAttendance = async () => {
    setUpdatingAttendance(true);
    try {
      const recordsToUpdate = records.filter((r) => r.teacherId != null);

      if (recordsToUpdate.length === 0) {
        toast.error("No attendance records with mapped teachers to update. Map employees to teachers first.");
        return;
      }

      await updatePayrollRecords(recordsToUpdate);
      toast.success(`Updated ${recordsToUpdate.length} attendance records in backend`);
    } catch {
      toast.error("Failed to update attendance records");
    } finally {
      setUpdatingAttendance(false);
    }
  };

  const handleSaveHolidays = async () => {
    if (holidayDates.length === 0) {
      toast.error("No holidays selected. Pick dates from the calendar first.");
      return;
    }

    setSavingHolidays(true);
    try {
      // Build holiday records for all mapped employees on the selected dates
      const holidayRecords: PayrollAttendanceRecord[] = [];
      for (const date of holidayDates) {
        const dateKey = formatDateKey(date);
        for (const machineId of uniqueMachineIds) {
          const mapping = mappings.find((m) => m.machineId === machineId);
          if (!mapping?.teacherId) continue;

          // Check if a record already exists for this employee+date
          const existing = records.find(
            (r) => r.machineId === machineId && r.date === dateKey
          );
          if (existing) {
            // Update existing record status to Holiday
            holidayRecords.push({ ...existing, status: "Holiday" });
          } else {
            // Create a new holiday record
            holidayRecords.push({
              machineId,
              date: dateKey,
              status: "Holiday",
              teacherId: mapping.teacherId,
              employeeName: mapping.name,
            });
          }
        }
      }

      if (holidayRecords.length === 0) {
        toast.error("No mapped employees found for the selected holiday dates.");
        return;
      }

      await savePayrollRecords(holidayRecords);
      toast.success(`Saved ${holidayRecords.length} holiday attendance records`);

      // Refresh data to reflect saved holidays
      await loadData();
    } catch {
      toast.error("Failed to save holiday attendance");
    } finally {
      setSavingHolidays(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-100">
                <Clock className="h-3.5 w-3.5" />
                Biometric Payroll
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Payroll & Attendance
              </h1>
              <p className="text-base text-slate-500 mt-2 leading-relaxed">
                Upload Zkteco reports, map machine IDs to staff, track attendance, and manage salaries with late deductions.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate} className="border-slate-200">
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
              <Button variant="outline" onClick={exportToExcel} className="border-slate-200">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (month === 0) {
                        setMonth(11);
                        setYear(year - 1);
                      } else {
                        setMonth(month - 1);
                      }
                    }}
                    className="border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
                    {monthName} {year}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (month === 11) {
                        setMonth(0);
                        setYear(year + 1);
                      } else {
                        setMonth(month + 1);
                      }
                    }}
                    className="border-slate-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {getMonthName(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem key={i} value={String(now.getFullYear() - 2 + i)}>
                        {now.getFullYear() - 2 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="whitespace-nowrap">Late ≥ 10:00</span>
                  <span className="text-slate-300">|</span>
                  <span className="whitespace-nowrap">Half ≤ 14:40</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="border-slate-200 gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      {holidayDates.length > 0
                        ? `${holidayDates.length} holiday(s)`
                        : "Mark Holidays"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="multiple"
                      selected={holidayDates}
                      onSelect={(dates) => {
                        setHolidayDates(dates || []);
                        // Update records: mark selected dates as "holiday" for all mapped employees
                        if (dates) {
                          setRecords((prev) => {
                            const updated = prev.map((r) => {
                              const recordDate = new Date(r.date + "T00:00:00");
                              const isHoliday = dates.some(
                                (d) =>
                                  d.getFullYear() === recordDate.getFullYear() &&
                                  d.getMonth() === recordDate.getMonth() &&
                                  d.getDate() === recordDate.getDate()
                              );
                              if (isHoliday && r.teacherId != null) {
                                return { ...r, status: "Holiday" as const };
                              }
                              return r;
                            });
                            return updated;
                          });
                        }
                      }}
                      month={new Date(year, month)}
                      className="rounded-lg border-0"
                    />
                  </PopoverContent>
                </Popover>
                {holidayDates.length > 0 && (
                  <Button
                    onClick={handleSaveHolidays}
                    disabled={savingHolidays}
                    size="sm"
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5"
                  >
                    {savingHolidays ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingHolidays ? "Saving..." : `Save ${holidayDates.length} Holiday(s)`}
                  </Button>
                )}
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div>
                  <Input
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileUpload}
                    disabled={parsing}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsMappingDialogOpen(true)}
                  className="border-slate-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Map Staff
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900">{uniqueMachineIds.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Present Days</p>
              <p className="text-2xl font-bold text-emerald-600">
                {records.filter((r) => r.status === "Present").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Absent / Missing</p>
              <p className="text-2xl font-bold text-red-600">
                {records.filter((r) => r.status === "Absent").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Late Days</p>
              <p className="text-2xl font-bold text-amber-600">
                {records.filter((r) => r.isLate).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Loading payroll data...</p>
          </div>
        )}

        {/* Attendance Grid */}
        {!loading && (
          <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Monthly Attendance
              </CardTitle>
              <CardDescription>
                Click any cell to edit. Red = absent, amber = half day, blue dot = late check-in.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[1000px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white border-b border-r border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[200px] z-10">
                      Employee
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th
                        key={i}
                        className="border-b border-r border-slate-200 p-2 text-center font-medium text-slate-600 min-w-[42px]"
                      >
                        {i + 1}
                      </th>
                    ))}
                    <th className="border-b border-slate-200 p-3 text-center font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMachineIds.map((machineId) => {
                    const mapping = getMapping(machineId);
                    const teacherName = getTeacherName(mapping?.teacherId);
                    return (
                      <tr key={machineId} className="hover:bg-slate-50/50">
                        <td className="sticky left-0 bg-white border-b border-r border-slate-200 p-3 z-10">
                          <div>
                            <p className="font-medium text-slate-900">
                              {mapping?.name || `Employee ${machineId}`}
                            </p>
                            <p className="text-xs text-slate-500">ID: {machineId}</p>
                            {mapping?.teacherId ? (
                              <Badge
                                variant="outline"
                                className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                              >
                                {teacherName}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="mt-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                              >
                                Unmapped
                              </Badge>
                            )}
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }, (_, day) => {
                          const record = getRecordForDay(machineId, day + 1);
                          const isMissing = !record || record.status === "Absent";
                          const isHalf = record?.status === "Halfday";
                          return (
                            <td
                              key={day}
                              className={`border-b border-r border-slate-200 p-1 text-center cursor-pointer transition-colors hover:bg-slate-100 ${
                                isMissing ? "bg-red-50/50" : isHalf ? "bg-amber-50/50" : "bg-white"
                              }`}
                              onClick={() =>
                                record
                                  ? handleEditRecord(record)
                                  : handleAddMissingRecord(
                                      machineId,
                                      formatDateKey(new Date(year, month, day + 1))
                                    )
                              }
                              title={record ? `${record.checkIn || ""} - ${record.checkOut || ""}` : "Add attendance"}
                            >
                              {record ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  {record.status === "Present" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                  {record.status === "Absent" && <AlertCircle className="h-3 w-3 text-red-500" />}
                                  {record.status === "Halfday" && <Clock className="h-3 w-3 text-amber-500" />}
                                  {record.status === "Leave" && <Clock className="h-3 w-3 text-blue-500" />}
                                  {record.status === "Holiday" && <Clock className="h-3 w-3 text-slate-400" />}
                                  {record.checkIn && (
                                    <span
                                      className={`text-[9px] leading-tight ${
                                        record.isLate ? "text-amber-700 font-semibold" : "text-slate-500"
                                      }`}
                                    >
                                      {record.checkIn}
                                    </span>
                                  )}
                                  {record.checkOut && (
                                    <span className="text-[9px] leading-tight text-slate-400">
                                      {record.checkOut}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-red-400">+</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="border-b border-slate-200 p-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMappingDialogOpen(true)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4 text-slate-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Save / Update Attendance Buttons */}
        {!loading && records.length > 0 && (
          <div className="flex justify-end gap-3 mb-6">
            <Button
              onClick={handleUpdateAttendance}
              disabled={updatingAttendance}
              size="lg"
              variant="outline"
              className="gap-2 px-8 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {updatingAttendance ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {updatingAttendance ? "Updating..." : "Update Attendance"}
            </Button>
            <Button
              onClick={handleSaveAttendance}
              disabled={savingAttendance}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 px-8"
            >
              {savingAttendance ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {savingAttendance ? "Saving..." : "Save Attendance to Backend"}
            </Button>
          </div>
        )}

        {/* Salary Summary */}
        {!loading && filteredMachineIds.length > 0 && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                  Salary Summary
                </CardTitle>
                <CardDescription>
                  3 late days = 1 day salary deduction. Absent and half-day cuts are applied automatically.
                </CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Button variant="outline" onClick={exportSalarySheet} className="border-slate-200">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Salary Sheet
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border-b border-r border-slate-200 p-3 text-left font-semibold text-slate-700">
                      Employee
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-right font-semibold text-slate-700">
                      Monthly Salary
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-center font-semibold text-slate-700">
                      Present
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-center font-semibold text-slate-700">
                      Absent
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-center font-semibold text-slate-700">
                      Half Day
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-center font-semibold text-slate-700">
                      Late
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-center font-semibold text-slate-700">
                      Late Cut Days
                    </th>
                    <th className="border-b border-r border-slate-200 p-3 text-right font-semibold text-slate-700">
                      Total Cut
                    </th>
                    <th className="border-b border-slate-200 p-3 text-right font-semibold text-slate-700">
                      Net Salary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salarySummary.map((summary) => (
                    <tr key={summary.machineId} className="hover:bg-slate-50/50">
                      <td className="border-b border-r border-slate-200 p-3">
                        <p className="font-medium text-slate-900">{summary.name}</p>
                        <p className="text-xs text-slate-500">ID: {summary.machineId}</p>
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-right">
                        ₹{summary.monthlySalary.toLocaleString("en-IN")}
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-center text-emerald-600 font-medium">
                        {summary.present}
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-center text-red-600 font-medium">
                        {summary.absent}
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-center text-amber-600 font-medium">
                        {summary.halfDay}
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-center text-amber-600 font-medium">
                        {summary.late}
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-center text-red-600 font-medium">
                        {summary.lateCutDays}
                      </td>
                      <td className="border-b border-r border-slate-200 p-3 text-right text-red-600 font-medium">
                        ₹{summary.totalCut.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="border-b border-slate-200 p-3 text-right text-emerald-700 font-bold">
                        ₹{summary.netSalary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && filteredMachineIds.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No attendance data</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Upload a Zkteco report to import attendance records for {monthName} {year}.
            </p>
          </div>
        )}
      </div>

      {/* Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden p-0">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-200">
            <DialogHeader className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2.5 text-xl">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    Map Machine IDs to Staff
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1.5">
                    Assign teachers and set monthly salaries for each biometric machine ID.
                    All data is saved directly to the backend.
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
                  {mappings.filter((m) => m.teacherId).length}/{mappings.length} mapped
                </Badge>
              </div>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(85vh - 140px)" }}>
            {mappings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Upload className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-base font-semibold text-slate-900">No employees found</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Upload a Zkteco attendance report first to populate the employee list.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mappings.map((mapping, idx) => {
                  const localEdit = localMappingEdits[mapping.machineId];
                  const currentTeacherId = localEdit?.teacherId ?? mapping.teacherId ?? null;
                  const currentSalary = localEdit?.monthlySalary ?? mapping.monthlySalary ?? 0;
                  const hasChanges =
                    currentTeacherId !== (mapping.teacherId ?? null) ||
                    currentSalary !== (mapping.monthlySalary ?? 0);
                  const isSaving = savingMapping === mapping.machineId;
                  const isMapped = mapping.teacherId != null;

                  return (
                    <div
                      key={mapping.machineId}
                      className={`rounded-xl border transition-all duration-200 ${
                        isMapped
                          ? "border-emerald-200 bg-emerald-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      } ${isSaving ? "opacity-70 pointer-events-none" : ""}`}
                    >
                      <div className="p-4">
                        {/* Row 1: Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isMapped
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{mapping.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-mono text-[11px] px-2 py-0">
                                  ID: {mapping.machineId}
                                </Badge>
                                {isMapped && (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px] px-2 py-0">
                                    Mapped
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSaving && (
                            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium shrink-0">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving...
                            </div>
                          )}
                        </div>

                        {/* Row 2: Form fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                          {/* Teacher Select */}
                          <div className="sm:col-span-2">
                            <Label className="text-xs text-slate-500 mb-1.5 block">Assign Teacher</Label>
                            <Select
                              value={currentTeacherId ? String(currentTeacherId) : "unmapped"}
                              onValueChange={(v) =>
                                setLocalMappingEdits((prev) => ({
                                  ...prev,
                                  [mapping.machineId]: {
                                    teacherId: v === "unmapped" ? null : Number(v),
                                    monthlySalary: currentSalary,
                                  },
                                }))
                              }
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unmapped">
                                  <span className="text-slate-400">— Not assigned —</span>
                                </SelectItem>
                                {teachers.map((t) => (
                                  <SelectItem key={t.id} value={String(t.id)}>
                                    {t.fullName}
                                    {t.employee_id ? ` (${t.employee_id})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Salary Input */}
                          <div className="sm:col-span-2">
                            <Label className="text-xs text-slate-500 mb-1.5 block">Monthly Salary (₹)</Label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="number"
                                min="0"
                                step="100"
                                placeholder="0"
                                value={String(currentSalary)}
                                onChange={(e) =>
                                  setLocalMappingEdits((prev) => ({
                                    ...prev,
                                    [mapping.machineId]: {
                                      teacherId: currentTeacherId,
                                      monthlySalary: e.target.value === "" ? 0 : Number(e.target.value),
                                    },
                                  }))
                                }
                                className="pl-9 w-full bg-white"
                              />
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="sm:col-span-1">
                            <Button
                              size="sm"
                              disabled={!hasChanges || isSaving}
                              onClick={() =>
                                handleSaveMapping(mapping.machineId, currentTeacherId, currentSalary)
                              }
                              className={`w-full ${
                                hasChanges
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-1" />
                              )}
                              {isSaving ? "Saving" : hasChanges ? "Save" : "Saved"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {mappings.filter((m) => m.teacherId).length} of {mappings.length} employees mapped
              {mappings.some((m) => m.monthlySalary && m.monthlySalary > 0)
                ? ` · ${mappings.filter((m) => (m.monthlySalary ?? 0) > 0).length} salaries set`
                : ""}
            </p>
            <Button
              onClick={() => {
                setLocalMappingEdits({});
                setIsMappingDialogOpen(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-emerald-600" />
              Edit Attendance
            </DialogTitle>
            <DialogDescription>
              Update punch times and status for {editRecord?.date}.
            </DialogDescription>
          </DialogHeader>
          {editRecord && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Machine ID</Label>
                  <Input value={editRecord.machineId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={editRecord.date} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check In</Label>
                  <Input
                    type="time"
                    value={editRecord.checkIn || ""}
                    onChange={(e) => setEditRecord({ ...editRecord, checkIn: e.target.value, isLate: computeIsLate(e.target.value, editRecord.status) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check Out</Label>
                  <Input
                    type="time"
                    value={editRecord.checkOut || ""}
                    onChange={(e) => setEditRecord({ ...editRecord, checkOut: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editRecord.status}
                  onValueChange={(v) =>
                    setEditRecord({ ...editRecord, status: v as PayrollAttendanceRecord["status"], isLate: computeIsLate(editRecord.checkIn, v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={editRecord.workHours || ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, workHours: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Input
                  value={editRecord.remarks || ""}
                  onChange={(e) => setEditRecord({ ...editRecord, remarks: e.target.value })}
                  placeholder="Optional note"
                />
              </div>
              {editRecord.checkIn && isCheckInLate(editRecord.checkIn) && (
                <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  Check-in is late (≥ 10:00)
                </div>
              )}
              {editRecord.checkOut && isEarlyCheckout(editRecord.checkOut) && (
                <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  Early checkout (≤ 14:40) — half day
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {editRecord?.machineId && editRecord?.date && (
              <Button
                variant="destructive"
                onClick={() => editRecord && handleDeleteRecord(editRecord)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

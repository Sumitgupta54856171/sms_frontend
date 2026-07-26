import React, { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Edit2,
  Search,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  UserPlus,
  Trash2,
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
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import {
  fetchPayrollRecords,
  savePayrollRecords,
  saveStaffMappings,
  fetchStaffMappings,
  deletePayrollRecord,
  type PayrollAttendanceRecord,
  type StaffMapping,
} from "@/api/payroll";
import { fetchTeachers } from "@/api/teacher";

interface ParsedRow {
  machineId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  workHours?: number;
}

interface TeacherOption {
  id: number;
  fullName: string;
  employee_id?: string;
}

const STATUS_OPTIONS = [
  { value: "present", label: "Present", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "absent", label: "Absent", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "half_day", label: "Half Day", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "leave", label: "Leave", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "holiday", label: "Holiday", color: "bg-slate-100 text-slate-700 border-slate-200" },
];

function getMonthName(monthIndex: number): string {
  return new Date(2024, monthIndex, 1).toLocaleString("default", { month: "long" });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseTime(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  // Handle Excel time serial numbers
  if (!isNaN(Number(str)) && str.includes(".")) {
    const totalMinutes = Math.round(Number(str) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return str;
}

function normalizeHeader(header: string): string {
  return String(header).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectColumnIndex(headers: string[], possibleNames: string[]): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const name of possibleNames) {
    const idx = normalizedHeaders.indexOf(normalizeHeader(name));
    if (idx !== -1) return idx;
  }
  return -1;
}

async function parseXlsFile(file: File): Promise<ParsedRow[]> {
  try {
    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as string[][];

    const rows = json.filter((r) => r.some((c) => c !== undefined && c !== null && String(c).trim() !== ""));
    if (rows.length < 2) return [];

    // Try to find header row
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowText = rows[i].join(" ").toLowerCase();
      if (
        rowText.includes("ac-no") ||
        rowText.includes("userid") ||
        rowText.includes("name") ||
        rowText.includes("date") ||
        rowText.includes("time") ||
        rowText.includes("status")
      ) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
    const machineIdIdx = detectColumnIndex(headers, ["ac-no", "acno", "userid", "user id", "id", "empid", "employeeid", "employee id", "code"]);
    const nameIdx = detectColumnIndex(headers, ["name", "empname", "employee name", "username"]);
    const dateIdx = detectColumnIndex(headers, ["date", "attdate", "attendance date"]);
    const timeIdx = detectColumnIndex(headers, ["time", "clocktime", "punchtime"]);
    const statusIdx = detectColumnIndex(headers, ["status", "attstatus", "state"]);
    const checkInIdx = detectColumnIndex(headers, ["clockin", "checkin", "in time", "intime", "first clock"]);
    const checkOutIdx = detectColumnIndex(headers, ["clockout", "checkout", "out time", "outtime", "last clock"]);
    const workHoursIdx = detectColumnIndex(headers, ["worktime", "work hours", "workhours", "hours worked"]);

    const parsed: ParsedRow[] = [];
    const groupedByDate: Record<string, ParsedRow[]> = {};

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const machineId = machineIdIdx >= 0 ? String(row[machineIdIdx] ?? "").trim() : "";
      const name = nameIdx >= 0 ? String(row[nameIdx] ?? "").trim() : "";
      const dateRaw = dateIdx >= 0 ? String(row[dateIdx] ?? "").trim() : "";
      const timeRaw = timeIdx >= 0 ? String(row[timeIdx] ?? "").trim() : "";

      if (!machineId && !name) continue;

      let date = dateRaw;
      if (!date && timeRaw) {
        const parts = timeRaw.split(" ");
        if (parts.length >= 2) date = parts[0];
      }

      if (!date) continue;

      // Normalize date to YYYY-MM-DD
      let normalizedDate = date;
      if (date.includes("/")) {
        const [d, m, y] = date.split("/");
        normalizedDate = `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else if (date.includes("-")) {
        const parts = date.split("-");
        if (parts[0].length === 4) {
          normalizedDate = date;
        } else {
          const [d, m, y] = parts;
          normalizedDate = `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      }

      const key = `${machineId}_${normalizedDate}`;
      if (!groupedByDate[key]) groupedByDate[key] = [];

      const checkIn = checkInIdx >= 0 ? parseTime(row[checkInIdx]) : undefined;
      const checkOut = checkOutIdx >= 0 ? parseTime(row[checkOutIdx]) : undefined;
      const time = parseTime(timeRaw);
      const status = statusIdx >= 0 ? String(row[statusIdx] ?? "").trim() : undefined;
      const workHours = workHoursIdx >= 0 ? Number(row[workHoursIdx]) || undefined : undefined;

      groupedByDate[key].push({
        machineId,
        employeeName: name,
        date: normalizedDate,
        checkIn: checkIn || time,
        checkOut,
        status,
        workHours,
      });
    }

    // Group multiple punches per day: first = checkIn, last = checkOut
    Object.values(groupedByDate).forEach((punches) => {
      const sorted = punches
        .filter((p) => p.checkIn || p.checkOut)
        .sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      parsed.push({
        machineId: first.machineId,
        employeeName: first.employeeName,
        date: first.date,
        checkIn: first.checkIn,
        checkOut: last?.checkOut || (sorted.length > 1 ? last?.checkIn : undefined),
        status: first.status,
        workHours: first.workHours,
      });
    });

    return parsed;
  } catch (error) {
    throw new Error("Failed to parse XLS file. Make sure 'xlsx' package is installed.");
  }
}

function calculateStatus(checkIn?: string, checkOut?: string): PayrollAttendanceRecord["status"] {
  if (!checkIn && !checkOut) return "absent";
  if (checkIn && !checkOut) return "half_day";
  return "present";
}

export default function PayrollView() {
  const user = useAppSelector((s) => s.auth.user);
  const userRole = user?.role ?? "";
  const normalizedRole = userRole.replace(/^ROLE_/i, "").toLowerCase();
  const isAdmin = ["admin", "super_admin"].includes(normalizedRole);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [records, setRecords] = useState<PayrollAttendanceRecord[]>([]);
  const [mappings, setMappings] = useState<StaffMapping[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<PayrollAttendanceRecord | null>(null);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const daysInMonth = getDaysInMonth(year, month);
  const monthName = getMonthName(month);

  useEffect(() => {
    loadData();
    loadTeachers();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, maps] = await Promise.all([
        fetchPayrollRecords(String(month + 1).padStart(2, "0"), year),
        fetchStaffMappings(),
      ]);
      setRecords(recs);
      setMappings(maps);
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

    if (!file.name.toLowerCase().endsWith(".xls") && !file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please upload an XLS or XLSX file");
      return;
    }

    setParsing(true);
    try {
      const parsed = await parseXlsFile(file);
      if (parsed.length === 0) {
        toast.error("No valid attendance records found in file");
        return;
      }

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
          });
          existingMachineIds.add(row.machineId);
        }

        const mapping = mappings.find((m) => m.machineId === row.machineId) ||
          newMappings.find((m) => m.machineId === row.machineId);

        return {
          machineId: row.machineId,
          date: row.date,
          checkIn: row.checkIn,
          checkOut: row.checkOut,
          status: calculateStatus(row.checkIn, row.checkOut),
          workHours: row.workHours,
          teacherId: mapping?.teacherId ?? null,
          staffId: mapping?.staffId ?? null,
          employeeName: row.employeeName,
        };
      });

      if (newMappings.length > 0) {
        await saveStaffMappings([...mappings, ...newMappings]);
        setMappings((prev) => [...prev, ...newMappings]);
        toast.info(`${newMappings.length} new employee(s) detected. Please map them to teachers/staff.`);
        setIsMappingDialogOpen(true);
      }

      const merged = mergeRecords(records, newRecords);
      await savePayrollRecords(merged);
      setRecords(merged);
      toast.success(`Imported ${newRecords.length} attendance records`);
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

  const handleSaveMapping = async (machineId: string, teacherId: number | null) => {
    const updated = mappings.map((m) =>
      m.machineId === machineId ? { ...m, teacherId, staffId: teacherId ? null : m.staffId } : m
    );
    await saveStaffMappings(updated);
    setMappings(updated);

    // Update all records for this machine
    const updatedRecords = records.map((r) =>
      r.machineId === machineId ? { ...r, teacherId } : r
    );
    await savePayrollRecords(updatedRecords);
    setRecords(updatedRecords);
    toast.success("Mapping saved");
  };

  const handleEditRecord = (record: PayrollAttendanceRecord) => {
    setEditRecord({ ...record });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editRecord) return;
    const updated = records.map((r) =>
      r.machineId === editRecord.machineId && r.date === editRecord.date ? editRecord : r
    );
    await savePayrollRecords(updated);
    setRecords(updated);
    setIsEditDialogOpen(false);
    setEditRecord(null);
    toast.success("Attendance record updated");
  };

  const handleDeleteRecord = async (record: PayrollAttendanceRecord) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const updated = records.filter(
      (r) => !(r.machineId === record.machineId && r.date === record.date)
    );
    if (record.id) await deletePayrollRecord(record.id);
    await savePayrollRecords(updated);
    setRecords(updated);
    toast.success("Record deleted");
  };

  const handleAddMissingRecord = (machineId: string, date: string) => {
    setEditRecord({
      machineId,
      date,
      status: "absent",
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
      return id.toLowerCase().includes(q) || name.includes(q) || teacher?.fullName.toLowerCase().includes(q);
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

  const downloadTemplate = () => {
    const headers = ["AC-No.", "Name", "Date", "Time", "Status"];
    const csv = "\uFEFF" + headers.join(",") + "\n";
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
    const headers = ["Machine ID", "Name", "Date", "Check In", "Check Out", "Status", "Work Hours", "Teacher"];
    const rows = records.map((r) => {
      const mapping = getMapping(r.machineId);
      return [
        r.machineId,
        mapping?.name || r.employeeName || "",
        r.date,
        r.checkIn || "",
        r.checkOut || "",
        r.status,
        r.workHours || "",
        getTeacherName(r.teacherId),
      ];
    });
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadFile(csv, `payroll_${year}_${month + 1}.csv`, "text/csv");
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
                Upload Zkteco XLS reports, map machine IDs to staff, track attendance, and edit missing punches.
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
                    accept=".xls,.xlsx"
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
                {records.filter((r) => r.status === "present").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Absent / Missing</p>
              <p className="text-2xl font-bold text-red-600">
                {records.filter((r) => r.status === "absent").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Half Days</p>
              <p className="text-2xl font-bold text-amber-600">
                {records.filter((r) => r.status === "half_day").length}
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
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Monthly Attendance
              </CardTitle>
              <CardDescription>
                Click on any cell to edit attendance. Red cells indicate missing punches.
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
                            <p className="font-medium text-slate-900">{mapping?.name || `Employee ${machineId}`}</p>
                            <p className="text-xs text-slate-500">ID: {machineId}</p>
                            {mapping?.teacherId ? (
                              <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                {teacherName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                Unmapped
                              </Badge>
                            )}
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }, (_, day) => {
                          const record = getRecordForDay(machineId, day + 1);
                          const isMissing = !record || record.status === "absent";
                          return (
                            <td
                              key={day}
                              className={`border-b border-r border-slate-200 p-1 text-center cursor-pointer transition-colors hover:bg-slate-100 ${
                                isMissing ? "bg-red-50/50" : "bg-white"
                              }`}
                              onClick={() =>
                                record
                                  ? handleEditRecord(record)
                                  : handleAddMissingRecord(machineId, formatDateKey(new Date(year, month, day + 1)))
                              }
                              title={record ? `${record.checkIn || ""} - ${record.checkOut || ""}` : "Add attendance"}
                            >
                              {record ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  {record.status === "present" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                  {record.status === "absent" && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                                  {record.status === "half_day" && <Clock className="h-3.5 w-3.5 text-amber-500" />}
                                  {record.status === "leave" && <Clock className="h-3.5 w-3.5 text-blue-500" />}
                                  {record.status === "holiday" && <Clock className="h-3.5 w-3.5 text-slate-400" />}
                                  {record.checkIn && (
                                    <span className="text-[10px] text-slate-500">{record.checkIn}</span>
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
                            onClick={() => {
                              setSelectedMachineId(machineId);
                              setIsMappingDialogOpen(true);
                            }}
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

        {/* Empty state */}
        {!loading && filteredMachineIds.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No attendance data</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Upload a Zkteco XLS file to import attendance records for {monthName} {year}.
            </p>
          </div>
        )}
      </div>

      {/* Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Map Machine IDs to Staff
            </DialogTitle>
            <DialogDescription>
              Connect each biometric machine ID to a teacher or staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3 mt-4">
            {mappings.map((mapping) => (
              <div
                key={mapping.machineId}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  selectedMachineId === mapping.machineId ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200"
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{mapping.name}</p>
                  <p className="text-xs text-slate-500">Machine ID: {mapping.machineId}</p>
                </div>
                <Select
                  value={mapping.teacherId ? String(mapping.teacherId) : "unmapped"}
                  onValueChange={(v) => handleSaveMapping(mapping.machineId, v === "unmapped" ? null : Number(v))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unmapped">— Unmapped —</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {mappings.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">
                No machine IDs found. Upload an XLS file first.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsMappingDialogOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Done
            </Button>
          </DialogFooter>
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
                    onChange={(e) => setEditRecord({ ...editRecord, checkIn: e.target.value })}
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
                  onValueChange={(v) => setEditRecord({ ...editRecord, status: v as PayrollAttendanceRecord["status"] })}
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
                  onChange={(e) => setEditRecord({ ...editRecord, workHours: Number(e.target.value) })}
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
            <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

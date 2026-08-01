import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  Loader2,
  Download,
  ChevronDown,
  ChevronRight,
  Users,
  GraduationCap,
  VenusAndMars,
  ClipboardCheck,
  X,
  CalendarDays,
  TrendingUp,
  School,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import { fetchAttendanceByDateRange, type AttendanceRecordWithGender } from "@/api/attendance";

// ─── Helpers ───────────────────────────────────────────────────────────
function getPercentage(part: number, total: number): string {
  if (total === 0) return "0.0";
  return ((part / total) * 100).toFixed(1);
}

/** Count total days between two date strings (inclusive). */
function getDaysInRange(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/** Get unique holiday dates from a set of records. */
function getHolidayDates(records: AttendanceRecordWithGender[]): Set<string> {
  return new Set(
    records.filter((r) => r.status === "holiday").map((r) => r.attendanceDate)
  );
}

/** Working days = days in range minus holidays. */
function getWorkingDaysInRange(startDate: string, endDate: string, records: AttendanceRecordWithGender[]): number {
  const totalDays = getDaysInRange(startDate, endDate);
  const holidays = getHolidayDates(records).size;
  return Math.max(0, totalDays - holidays);
}

interface ClassSummary {
  className: string;
  students: AttendanceRecordWithGender[];
  boys: AttendanceRecordWithGender[];
  girls: AttendanceRecordWithGender[];
  workingDays: number;
  holidayDays: number;
}

interface StudentSummary {
  studentId: number;
  studentName: string;
  gender: string;
  present: number;
  absent: number;
  holiday: number;
  workingDays: number;
  percentage: string;
}

export default function AttendanceSummary() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [startDate, setStartDate] = useState<Date>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date>(today);
  const [search, setSearch] = useState("");
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const formattedStart = useMemo(() => format(startDate, "yyyy-MM-dd"), [startDate]);
  const formattedEnd = useMemo(() => format(endDate, "yyyy-MM-dd"), [endDate]);

  // ─── Fetch attendance by date range ──────────────────────────────────
  const { data: records = [], isLoading, isError } = useQuery({
    queryKey: ["attendance-range", formattedStart, formattedEnd],
    queryFn: () => fetchAttendanceByDateRange(formattedStart, formattedEnd),
    enabled: !!formattedStart && !!formattedEnd,
    staleTime: 30_000,
  });

  // ─── Global working days for the selected range ────────────────────────
  const globalWorkingDays = useMemo(
    () => getWorkingDaysInRange(formattedStart, formattedEnd, records),
    [formattedStart, formattedEnd, records]
  );

  // ─── Group records by class ──────────────────────────────────────────
  const classSummaries = useMemo(() => {
    const grouped: Record<string, AttendanceRecordWithGender[]> = {};
    records.forEach((r) => {
      const cls = r.grade || "Unknown";
      if (!grouped[cls]) grouped[cls] = [];
      grouped[cls].push(r);
    });

    return Object.entries(grouped)
      .map(([className, classRecords]) => {
        const boys = classRecords.filter((s) => s.gender?.toLowerCase() === "male");
        const girls = classRecords.filter((s) => s.gender?.toLowerCase() === "female");
        const holidayDays = getHolidayDates(classRecords).size;
        return { className, students: classRecords, boys, girls, workingDays: globalWorkingDays, holidayDays };
      })
      .sort((a, b) => a.className.localeCompare(b.className));
  }, [records, globalWorkingDays]);

  // ─── Per-student summary for a class ─────────────────────────────────
  const getStudentSummaries = (classData: ClassSummary): StudentSummary[] => {
    const studentMap = new Map<number, StudentSummary>();

    classData.students.forEach((r) => {
      if (!studentMap.has(r.studentId)) {
        studentMap.set(r.studentId, {
          studentId: r.studentId,
          studentName: r.studentName,
          gender: r.gender || "",
          present: 0,
          absent: 0,
          holiday: 0,
          workingDays: classData.workingDays,
          percentage: "0.0",
        });
      }
      const s = studentMap.get(r.studentId)!;
      if (r.status === "present") s.present++;
      else if (r.status === "absent") s.absent++;
      else if (r.status === "holiday") s.holiday++;
    });

    const result = Array.from(studentMap.values());
    result.forEach((s) => {
      s.percentage = getPercentage(s.present, s.workingDays);
    });

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      return result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          String(s.studentId).includes(q)
      );
    }
    return result;
  };

  // ─── Group stats ─────────────────────────────────────────────────────
  const getGroupStats = (students: StudentSummary[]) => {
    const totalPresent = students.reduce((sum, s) => sum + s.present, 0);
    const totalWorkingDays = students.reduce((sum, s) => sum + s.workingDays, 0);
    const count = students.length;
    return {
      count,
      totalPresent,
      totalWorkingDays,
      percentage: getPercentage(totalPresent, totalWorkingDays),
      average: count > 0 ? (totalPresent / count).toFixed(1) : "0.0",
    };
  };

  const toggleClass = (className: string) => {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(className)) next.delete(className);
      else next.add(className);
      return next;
    });
  };

  // ─── Export CSV ──────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows: string[] = [];
    rows.push("Class,Student ID,Student Name,Gender,Present,Absent,Holiday,Working Days,Percentage");

    classSummaries.forEach((cls) => {
      const students = getStudentSummaries(cls);
      students.forEach((s) => {
        rows.push(
          `${cls.className},${s.studentId},"${s.studentName}",${s.gender},${s.present},${s.absent},${s.holiday},${s.workingDays},${s.percentage}%`
        );
      });

      // Class summary row
      const boys = students.filter((s) => s.gender?.toLowerCase() === "male");
      const girls = students.filter((s) => s.gender?.toLowerCase() === "female");
      const boysStats = getGroupStats(boys);
      const girlsStats = getGroupStats(girls);
      const allStats = getGroupStats(students);

      rows.push("");
      rows.push(`--- ${cls.className} Summary ---`);
      rows.push(`Working Days,${cls.workingDays},Holidays,${cls.holidayDays}`);
      rows.push(`Boys,${boysStats.count},Present: ${boysStats.totalPresent},,Percentage: ${boysStats.percentage}%,Average: ${boysStats.average}`);
      rows.push(`Girls,${girlsStats.count},Present: ${girlsStats.totalPresent},,Percentage: ${girlsStats.percentage}%,Average: ${girlsStats.average}`);
      rows.push(`Total,${allStats.count},Present: ${allStats.totalPresent},,Percentage: ${allStats.percentage}%,Average: ${allStats.average}`);
      rows.push("");
    });

    const csv = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_summary_${formattedStart}_to_${formattedEnd}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── Overall stats ───────────────────────────────────────────────────
  const overallStats = useMemo(() => {
    let totalPresent = 0;
    let totalWorkingDays = 0;
    let totalStudents = 0;
    let totalBoys = 0;
    let totalGirls = 0;
    let boysPresent = 0;
    let girlsPresent = 0;
    let boysWorkingDays = 0;
    let girlsWorkingDays = 0;

    classSummaries.forEach((cls) => {
      const students = getStudentSummaries(cls);
      students.forEach((s) => {
        totalStudents++;
        totalPresent += s.present;
        totalWorkingDays += s.workingDays;
        if (s.gender?.toLowerCase() === "male") {
          totalBoys++;
          boysPresent += s.present;
          boysWorkingDays += s.workingDays;
        } else if (s.gender?.toLowerCase() === "female") {
          totalGirls++;
          girlsPresent += s.present;
          girlsWorkingDays += s.workingDays;
        }
      });
    });

    return {
      totalStudents,
      totalPresent,
      totalWorkingDays,
      percentage: getPercentage(totalPresent, totalWorkingDays),
      average: totalStudents > 0 ? (totalPresent / totalStudents).toFixed(1) : "0.0",
      totalBoys,
      boysPresent,
      boysWorkingDays,
      boysPercentage: getPercentage(boysPresent, boysWorkingDays),
      boysAverage: totalBoys > 0 ? (boysPresent / totalBoys).toFixed(1) : "0.0",
      totalGirls,
      girlsPresent,
      girlsWorkingDays,
      girlsPercentage: getPercentage(girlsPresent, girlsWorkingDays),
      girlsAverage: totalGirls > 0 ? (girlsPresent / totalGirls).toFixed(1) : "0.0",
    };
  }, [classSummaries, search]);

  const clearSearch = () => setSearch("");

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Attendance Summary
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Attendance Summary
              </h1>
              <p className="text-base text-slate-500 mt-2 leading-relaxed">
                View attendance summary by class with gender-wise breakdown for any date range. Holidays are excluded from working-day calculations.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={exportCSV}
              disabled={records.length === 0}
              className="border-slate-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Date Range Picker */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-44 justify-start text-left font-normal bg-white border-slate-200">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {format(startDate, "MM/dd/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-44 justify-start text-left font-normal bg-white border-slate-200">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {format(endDate, "MM/dd/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search student by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white border-slate-200"
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Loading attendance data...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-lg font-semibold text-red-600">Failed to load attendance data</p>
            <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
          </div>
        )}

        {/* Overall Summary */}
        {!isLoading && !isError && records.length > 0 && (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total Students</p>
                      <p className="text-2xl font-bold text-slate-900">{overallStats.totalStudents}</p>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Overall Attendance</p>
                      <p className="text-2xl font-bold text-emerald-600">{overallStats.percentage}%</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {overallStats.totalPresent} / {overallStats.totalWorkingDays} working days
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Boys Average</p>
                      <p className="text-2xl font-bold text-blue-600">{overallStats.boysPercentage}%</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {overallStats.totalBoys} students | Avg: {overallStats.boysAverage}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Girls Average</p>
                      <p className="text-2xl font-bold text-pink-600">{overallStats.girlsPercentage}%</p>
                    </div>
                    <div className="p-2 bg-pink-50 rounded-lg">
                      <VenusAndMars className="h-5 w-5 text-pink-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {overallStats.totalGirls} students | Avg: {overallStats.girlsAverage}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Per-Class Breakdown */}
            <div className="space-y-4">
              {classSummaries.map((cls) => {
                const students = getStudentSummaries(cls);
                const boys = students.filter((s) => s.gender?.toLowerCase() === "male");
                const girls = students.filter((s) => s.gender?.toLowerCase() === "female");
                const boysStats = getGroupStats(boys);
                const girlsStats = getGroupStats(girls);
                const allStats = getGroupStats(students);
                const isExpanded = expandedClasses.has(cls.className);

                return (
                  <Card key={cls.className} className="border-slate-200 shadow-sm overflow-hidden">
                    {/* Class Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-slate-50/80 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors"
                      onClick={() => toggleClass(cls.className)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900">{cls.className}</h3>
                          <p className="text-xs text-slate-500">
                            {students.length} students · {cls.workingDays} working days · {cls.holidayDays} holidays
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600 font-medium">
                          Boys: {boysStats.percentage}%
                        </span>
                        <span className="text-pink-600 font-medium">
                          Girls: {girlsStats.percentage}%
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Total: {allStats.percentage}%
                        </Badge>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <CardContent className="p-0">
                        {/* Gender Summary Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white border-b border-slate-100">
                          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-blue-600" />
                              </div>
                              <p className="text-sm font-semibold text-blue-800">Boys</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{boysStats.percentage}%</p>
                            <Progress value={parseFloat(boysStats.percentage)} className="h-2 mt-2 bg-blue-100" color="blue-600"/>
                            <p className="text-xs text-blue-600 mt-2">
                              {boysStats.totalPresent} present / {boysStats.totalWorkingDays} days · {boysStats.count} students
                            </p>
                          </div>
                          <div className="rounded-xl bg-pink-50/70 border border-pink-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-pink-100 rounded-lg">
                                <VenusAndMars className="h-4 w-4 text-pink-600" />
                              </div>
                              <p className="text-sm font-semibold text-pink-800">Girls</p>
                            </div>
                            <p className="text-2xl font-bold text-pink-700">{girlsStats.percentage}%</p>
                            <Progress value={parseFloat(girlsStats.percentage)} className="h-2 mt-2 bg-pink-100" color="pink-800"/>
                            <p className="text-xs text-pink-600 mt-2">
                              {girlsStats.totalPresent} / {girlsStats.totalWorkingDays} days · {girlsStats.count} students
                            </p>
                          </div>
                          <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-emerald-100 rounded-lg">
                                <School className="h-4 w-4 text-emerald-600" />
                              </div>
                              <p className="text-sm font-semibold text-emerald-800">Total</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{allStats.percentage}%</p>
                            <Progress value={parseFloat(allStats.percentage)} className="h-2 mt-2 bg-emerald-100" color="emerald-600" />
                            <p className="text-xs text-emerald-600 mt-2">
                              {allStats.totalPresent} present / {allStats.totalWorkingDays} days · {allStats.count} students
                            </p>
                          </div>
                        </div>

                        {/* Student Table */}
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-500">Student</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500">Gender</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 text-center">Present</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 text-center">Absent</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 text-center">Holiday</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 text-center">Working Days</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 text-center">Percentage</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500">Progress</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {students.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                                    No students match your search.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                <>
                                  {students.map((s) => (
                                    <TableRow key={s.studentId} className="hover:bg-slate-50">
                                      <TableCell className="font-medium text-slate-900">{s.studentName}</TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={
                                            s.gender?.toLowerCase() === "male"
                                              ? "bg-blue-50 text-blue-700 border-blue-200"
                                              : s.gender?.toLowerCase() === "female"
                                              ? "bg-pink-50 text-pink-700 border-pink-200"
                                              : "bg-slate-50 text-slate-500 border-slate-200"
                                          }
                                        >
                                          {s.gender || "—"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center text-emerald-600 font-medium">{s.present}</TableCell>
                                      <TableCell className="text-center text-red-600 font-medium">{s.absent}</TableCell>
                                      <TableCell className="text-center text-purple-600 font-medium">{s.holiday}</TableCell>
                                      <TableCell className="text-center text-slate-600">{s.workingDays}</TableCell>
                                      <TableCell className="text-center">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            parseFloat(s.percentage) >= 75
                                              ? "bg-emerald-100 text-emerald-700"
                                              : parseFloat(s.percentage) >= 50
                                              ? "bg-amber-100 text-amber-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {s.percentage}%
                                        </span>
                                      </TableCell>
                                      <TableCell className="w-32">
                                        <Progress
                                          value={parseFloat(s.percentage)}
                                          className="h-2"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {/* Class Total Row */}
                                  <TableRow className="bg-slate-50/80 font-semibold">
                                    <TableCell colSpan={2} className="text-slate-700">Class Total</TableCell>
                                    <TableCell className="text-center text-emerald-700">{allStats.totalPresent}</TableCell>
                                    <TableCell className="text-center text-red-700">—</TableCell>
                                    <TableCell className="text-center text-purple-700">—</TableCell>
                                    <TableCell className="text-center text-slate-700">{allStats.totalWorkingDays}</TableCell>
                                    <TableCell className="text-center text-emerald-700">{allStats.percentage}%</TableCell>
                                    <TableCell className="w-32">
                                      <Progress value={parseFloat(allStats.percentage)} className="h-2 bg-slate-200" />
                                    </TableCell>
                                  </TableRow>
                                </>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !isError && records.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No attendance data</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Select a date range to view the attendance summary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

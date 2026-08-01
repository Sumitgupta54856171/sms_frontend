import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  X,
  Users,
  Save,
  Loader2,
  Pencil,
  PencilOff,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudents, fetchStudentsByClass, type StudentResponse } from "@/api/student";
import {
  saveAttendance,
  updateAttendance,
  fetchAttendanceByDate,
  fetchAttendanceByClassAndDate,
  type AttendancePayload,
  type AttendanceRecord,
} from "@/api/attendance";
import { getCookie } from "@/lib/utils";
import { fetchTeacherClass } from "@/api/teacher";

const CLASSES = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

const EMPTY_STUDENTS: StudentResponse[] = [];
const EMPTY_ATTENDANCE: AttendanceRecord[] = [];

/** Get initials from a name string */
const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);


interface StudentRow {
  id: number;
  name: string;
  rollNumber: string;
  scholarNo: string;
  status: "present" | "absent" | "holiday" | null;
}

export default function Attendance() {
  const queryClient = useQueryClient();

  // Use cookie for instant role detection (no Redux delay)
  const roleFromCookie = (getCookie("role") || "").replace(/^ROLE_/i, "");
  const isTeacher = roleFromCookie?.toLowerCase() === "teacher";

  // Fetch teacher's class via useQuery (reliable, cached, always fresh)
  const { data: teacherClassName = "" } = useQuery({
    queryKey: ["teacher-class"],
    queryFn: fetchTeacherClass,
    enabled: isTeacher,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedClass, setSelectedClass] = useState(
    isTeacher ? "" : "Nursery"
  );

  // Once teacher's class is fetched, set it as selected
  useEffect(() => {
    if (isTeacher && teacherClassName) {
      setSelectedClass(teacherClassName);
    }
  }, [isTeacher, teacherClassName]);
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date]);

  // ─── Derive numeric class number from selectedClass ──────────────────
  // "Grade 1" → "1", "Nursery" → "Nursery", "LKG" → "LKG", etc.
  const classNumber = useMemo(() => {
    const match = selectedClass.match(/Grade\s+(\d+)/i);
    return match ? match[1] : selectedClass;
  }, [selectedClass]);

  // ─── Fetch students ──────────────────────────────────────────────────
  // Teachers use class-specific API; admins fetch all students
  const studentsQueryKey = isTeacher ? ["students", "class", classNumber] : ["students"];
  const studentsQueryFn = isTeacher
    ? () => fetchStudentsByClass(classNumber)
    : fetchStudents;

  const { data: allStudents, isLoading: studentsLoading } = useQuery({
    queryKey: studentsQueryKey,
    queryFn: studentsQueryFn,
    enabled: isTeacher ? !!classNumber : true,
  });

  // ─── Fetch existing attendance for selected date ─────────────────────
  // Teachers use class+date API; admins use date-only API
  const attendanceQueryKey = isTeacher
    ? ["attendance", classNumber, formattedDate]
    : ["attendance", formattedDate];
  const attendanceQueryFn = isTeacher
    ? () => fetchAttendanceByClassAndDate(classNumber, formattedDate)
    : () => fetchAttendanceByDate(formattedDate);

  const { data: existingAttendance } = useQuery({
    queryKey: attendanceQueryKey,
    queryFn: attendanceQueryFn,
    enabled: !!formattedDate && (isTeacher ? !!classNumber : true),
    retry: 1,
    staleTime: 30_000,
  });

  const studentList = allStudents ?? EMPTY_STUDENTS;
  const attendanceList = existingAttendance ?? EMPTY_ATTENDANCE;

  // ─── Build student list when data changes ────────────────────────────
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    if (!allStudents) {
      return;
    }

    let classStudents: StudentResponse[];

    if (isTeacher) {
      // For teachers, fetchStudentsByClass returns { studentdetail: [...] }
      const detail = (allStudents as any)?.studentdetail ?? [];
      classStudents = detail.map((s: any, idx: number) => ({
        id: s.studentId ?? s.id ?? idx,
        name: s.studentName ?? s["Student name"] ?? "",
        classInfo: s.className ?? selectedClass,
        roll: s.rolleNo ?? "-",
        scholar_no: s.scholarNo ?? "-",
        status: "active",
      }));
    } else {
      // For admins, filter the full student list by selected class
      classStudents = studentList.filter((s: StudentResponse) => {
        const classInfo = s.classInfo ?? "";
        // Normalize: strip "Grade " prefix for comparison
        const normalizedClassInfo = classInfo.replace(/^Grade\s+/i, "");
        if (["Nursery", "LKG", "UKG"].includes(selectedClass)) {
          return normalizedClassInfo === selectedClass;
        }
        const classNum = normalizedClassInfo.replace(/\D/g, "");
        const selectedNum = selectedClass.replace(/\D/g, "");
        return classNum && selectedNum && classNum === selectedNum;
      });
    }

    // Merge with existing attendance records (skip records with null studentId)
    const validAttendance = attendanceList.filter((a) => a.studentId != null);
    console.log("Merging attendance:", {
      classStudents: classStudents.map((s: any) => ({ id: s.id, name: s.name })),
      validAttendance: validAttendance.map((a) => ({ studentId: a.studentId, status: a.status })),
    });
    const merged: StudentRow[] = classStudents.map((s: any) => {
      const record = validAttendance.find((a) => a.studentId === s.id);
      return {
        id: s.id,
        name: s.name,
        rollNumber: s.roll ?? "",
        scholarNo: s.scholar_no ?? "",
        status: record?.status ?? null,
      };
    });

    setStudents(merged);
  }, [selectedClass, allStudents, existingAttendance, studentList, attendanceList, isTeacher]);

  // ─── Sort students by roll number ───────────────────────────────────
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const aNum = parseInt(a.rollNumber, 10) || 0;
      const bNum = parseInt(b.rollNumber, 10) || 0;
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [students, sortOrder]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const holidayCount = students.filter((s) => s.status === "holiday").length;

  // ─── Handle local status toggle ─────────────────────────────────────
  const handleStatusChange = useCallback(
    (id: number, newStatus: "present" | "absent" | "holiday") => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: s.status === newStatus ? null : newStatus } : s))
      );
    },
    []
  );

  // ─── Update mutation (individual edit) ───────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ studentId, status, date }: { studentId: number; status: "present" | "absent" | "holiday"; date: string }) =>
      updateAttendance(studentId, status, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", formattedDate] });
      toast.success("Attendance updated!");
    },
    onError: () => {
      toast.error("Failed to update attendance");
    },
  });

  const handleUpdate = (id: number, status: "present" | "absent" | "holiday") => {
    updateMutation.mutate({ studentId: id, status, date: formattedDate });
  };

  // ─── Save mutation (batch new records) ───────────────────────────────
  const saveMutation = useMutation({
    mutationFn: saveAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", formattedDate] });
      toast.success("Attendance saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save attendance");
    },
  });

  const handleSave = () => {
    const payload: AttendancePayload[] = students
      .filter((s) => s.status !== null)
      .map((s) => ({
        attendanceDate: formattedDate,
        studentId: s.id,
        status: s.status as "present" | "absent" | "holiday",
        grade: selectedClass,
      }));

    if (payload.length === 0) {
      toast.error("No attendance records to save");
      return;
    }

    saveMutation.mutate(payload);
  };

  // ─── Loading state ───────────────────────────────────────────────────
  const isLoading = studentsLoading;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Attendance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Mark attendance for a class.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Edit Toggle */}
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              onClick={() => setEditing((prev) => !prev)}
              className="gap-2"
            >
              {editing ? (
                <>
                  <PencilOff className="h-4 w-4" />
                  Done
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>

            {/* Class Select — teachers see only their assigned class */}
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={isTeacher}
            >
              <SelectTrigger className="w-36 bg-white">
                <SelectValue placeholder={isTeacher ? "Loading..." : "Select class"} />
              </SelectTrigger>
              <SelectContent>
                {isTeacher && teacherClassName ? (
                  <SelectItem key={teacherClassName} value={teacherClassName}>
                    {teacherClassName}
                  </SelectItem>
                ) : (
                  CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-44 justify-start text-left font-normal bg-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {format(date, "MM/dd/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Present
              </CardTitle>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Check className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {presentCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Absent
              </CardTitle>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <X className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {absentCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Holiday
              </CardTitle>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {holidayCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total roster
              </CardTitle>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Table */}
        <Card className="mb-6 overflow-hidden">
          {!selectedClass ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Users className="h-10 w-10 mr-3 text-slate-300" />
              <p className="text-lg">Select a class to view students</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-6 w-6" />
              <span className="ml-2 text-slate-500">Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Users className="h-10 w-10 mr-3 text-slate-300" />
              <p className="text-lg">No students found for {selectedClass}</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-56">Student</TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Roll No
                      {sortOrder === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Scholar No</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  {editing && <TableHead className="text-right w-24">Update</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                          {getInitials(student.name)}
                        </div>
                        <span className="text-slate-900">{student.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {student.rollNumber}
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {student.scholarNo}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant={
                            student.status === "present"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            student.status === "present"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "text-slate-600"
                          }
                          onClick={() =>
                            handleStatusChange(student.id, "present")
                          }
                        >
                          Present
                        </Button>

                        <Button
                          variant={
                            student.status === "absent"
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          className={
                            student.status === "absent"
                              ? ""
                              : "text-slate-600"
                          }
                          onClick={() =>
                            handleStatusChange(student.id, "absent")
                          }
                        >
                          Absent
                        </Button>

                        <Button
                          variant={
                            student.status === "holiday"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            student.status === "holiday"
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "text-slate-600"
                          }
                          onClick={() =>
                            handleStatusChange(student.id, "holiday")
                          }
                        >
                          Holiday
                        </Button>
                      </div>
                    </TableCell>

                    {editing && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            updateMutation.isPending &&
                            updateMutation.variables?.studentId === student.id
                          }
                          onClick={() => {
                            if (student.status) {
                              handleUpdate(student.id, student.status);
                            }
                          }}
                          className="gap-1"
                        >
                          {updateMutation.isPending &&
                          updateMutation.variables?.studentId === student.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Update
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Summary & Save */}
        {selectedClass && students.length > 0 && (
          <Card className="flex flex-col sm:flex-row items-center justify-between p-4">
            <div className="text-sm text-slate-600 mb-4 sm:mb-0">
              <span className="font-semibold text-slate-900">Summary: </span>
              <span className="text-green-600 font-medium">
                {presentCount} Present
              </span>
              ,{" "}
              <span className="text-red-600 font-medium">
                {absentCount} Absent
              </span>
              ,{" "}
              <span className="text-purple-600 font-medium">
                {holidayCount} Holiday
              </span>{" "}
              out of {totalCount} students.
            </div>

            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save attendance
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
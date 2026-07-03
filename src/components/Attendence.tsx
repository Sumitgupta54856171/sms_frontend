import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  X,
  Users,
  Save,
  Loader2,
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
import { fetchStudents, type StudentResponse } from "@/api/student";
import {
  saveAttendance,
  fetchAttendanceByDate,
  type AttendancePayload,
  type AttendanceRecord,
} from "@/api/attendance";
const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

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

/** Local student row with attendance status */
interface StudentRow {
  id: number;
  name: string;
  status: "PRESENT" | "ABSENT" | null;
}

export default function Attendance() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState("__placeholder__");
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<StudentRow[]>([]);

  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date]);

  // ─── Fetch students ──────────────────────────────────────────────────
  const { data: allStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  // ─── Fetch existing attendance for selected date ─────────────────────
  const { data: existingAttendance } = useQuery({
    queryKey: ["attendance", formattedDate],
    queryFn: () => fetchAttendanceByDate(formattedDate),
    enabled: !!formattedDate,
    retry: 1,
    staleTime: 30_000,
  });

  const studentList = allStudents ?? EMPTY_STUDENTS;
  const attendanceList = existingAttendance ?? EMPTY_ATTENDANCE;

  // ─── Build student list when data changes ────────────────────────────
  useEffect(() => {
    if (!selectedClass || selectedClass === "__placeholder__") {
      setStudents([]);
      return;
    }

    if (!allStudents) {
      return;
    }

    // Filter students by selected class (match "Class 1" format)
    const classStudents = studentList.filter(
      (s) => s.classInfo?.toLowerCase() === selectedClass.toLowerCase()
    );

    // Merge with existing attendance records
    const merged: StudentRow[] = classStudents.map((s) => {
      const record = attendanceList.find((a) => a.student_id === s.id);
      return {
        id: s.id,
        name: s.name,
        status: record?.status ?? null,
      };
    });

    setStudents(merged);
  }, [selectedClass, allStudents, existingAttendance, studentList, attendanceList]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;

  // ─── Handle status toggle ────────────────────────────────────────────
  const handleStatusChange = useCallback(
    (id: number, newStatus: "PRESENT" | "ABSENT") => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: s.status === newStatus ? null : newStatus } : s))
      );
    },
    []
  );

  // ─── Save mutation ───────────────────────────────────────────────────
  const mutation = useMutation({
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
        student_id: s.id,
        status: s.status as "PRESENT" | "ABSENT",
      }));

    if (payload.length === 0) {
      toast.error("No attendance records to save");
      return;
    }

    mutation.mutate(payload);
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
            {/* Class Select */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select class
                </SelectItem>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <TableHead className="w-72">Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Mark Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
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
                      {student.id}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant={
                            student.status === "PRESENT"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            student.status === "PRESENT"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "text-slate-600"
                          }
                          onClick={() =>
                            handleStatusChange(student.id, "PRESENT")
                          }
                        >
                          Present
                        </Button>

                        <Button
                          variant={
                            student.status === "ABSENT"
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          className={
                            student.status === "ABSENT"
                              ? ""
                              : "text-slate-600"
                          }
                          onClick={() =>
                            handleStatusChange(student.id, "ABSENT")
                          }
                        >
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Summary & Save */}
        {selectedClass !== "__placeholder__" && students.length > 0 && (
          <Card className="flex flex-col sm:flex-row items-center justify-between p-4">
            <div className="text-sm text-slate-600 mb-4 sm:mb-0">
              <span className="font-semibold text-slate-900">Summary: </span>
              <span className="text-green-600 font-medium">
                {presentCount} Present
              </span>
              ,{" "}
              <span className="text-red-600 font-medium">
                {absentCount} Absent
              </span>{" "}
              out of {totalCount} students.
            </div>

            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? (
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
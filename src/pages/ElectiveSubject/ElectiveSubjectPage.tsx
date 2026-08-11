import { useState, useMemo, useCallback } from "react";
import {
  BookOpen,
  GraduationCap,
  Users,
  Save,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { fetchStudentsByClass } from "@/api/student";
import {
  saveElectiveSubjects,
  type ElectiveSubjectPayload,
} from "@/api/student";
import { COURSE_STREAMS } from "@/api/subject";

const CLASSES_11_12 = ["Grade 11", "Grade 12"];

// ─── Stream-wise elective subjects (the stream subjects are electives) ──
const STREAM_ELECTIVES: Record<string, string[]> = {
  Science: ["Physics", "Chemistry", "Biology", "Mathematics"],
  Commerce: ["Accountancy", "Business Studies", "Economics", "Mathematics"],
  Arts: ["History", "Political Science", "Geography", "Sociology"],
};

// ─── Common subjects for all streams in 11-12 ──────────────────────────
const COMMON_SUBJECTS = ["Hindi (Core)", "English (Core)"];

export default function ElectiveSubjectPage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState("__placeholder__");
  const [selectedStream, setSelectedStream] = useState("__placeholder__");
  const [searchTerm, setSearchTerm] = useState("");

  // Track selections: Map<studentId, string[]> of chosen elective subjects
  const [selections, setSelections] = useState<Map<number, string[]>>(new Map());

  // ─── Fetch students by class ─────────────────────────────────────────
  const {
    data: classData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["students-by-class", selectedClass],
    queryFn: () => fetchStudentsByClass(selectedClass),
    enabled: selectedClass !== "__placeholder__",
  });

  // Extract student list from response
  const students = useMemo(() => {
    if (!classData) return [];
    const raw = classData?.studentdetail ?? classData?.data ?? classData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [classData]);

  // Filter by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s: any) =>
        s.name?.toLowerCase().includes(term) ||
        s.scholar_no?.toLowerCase().includes(term) ||
        s.father_name?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Available elective subjects for the selected stream
  const electiveOptions = useMemo(() => {
    if (
      selectedStream === "__placeholder__" ||
      !STREAM_ELECTIVES[selectedStream]
    )
      return [];
    return STREAM_ELECTIVES[selectedStream];
  }, [selectedStream]);

  // ─── Toggle an elective subject for a student ────────────────────────
  const toggleElective = useCallback(
    (studentId: number, subject: string) => {
      setSelections((prev) => {
        const next = new Map(prev);
        const current = next.get(studentId) || [];
        if (current.includes(subject)) {
          next.set(
            studentId,
            current.filter((s) => s !== subject)
          );
        } else {
          next.set(studentId, [...current, subject]);
        }
        // Clean up empty arrays
        if (next.get(studentId)?.length === 0) {
          next.delete(studentId);
        }
        return next;
      });
    },
    []
  );

  // ─── Select all electives for a student ──────────────────────────────
  const toggleAllForStudent = useCallback(
    (studentId: number) => {
      setSelections((prev) => {
        const next = new Map(prev);
        const current = next.get(studentId) || [];
        if (current.length === electiveOptions.length) {
          next.delete(studentId);
        } else {
          next.set(studentId, [...electiveOptions]);
        }
        return next;
      });
    },
    [electiveOptions]
  );

  // ─── Reset selections when class/stream changes ──────────────────────
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelections(new Map());
    setSearchTerm("");
  };

  const handleStreamChange = (value: string) => {
    setSelectedStream(value);
    setSelections(new Map());
  };

  // ─── Save mutation ───────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payloadList: ElectiveSubjectPayload[]) => {
      return await saveElectiveSubjects(payloadList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students-by-class"] });
      toast.success("Elective subjects saved successfully");
      setSelections(new Map());
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to save elective subjects"
      );
    },
  });

  // ─── Handle save ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (selectedClass === "__placeholder__") {
      toast.error("Please select a class");
      return;
    }
    if (selectedStream === "__placeholder__") {
      toast.error("Please select a stream");
      return;
    }
    if (selections.size === 0) {
      toast.error("No elective subjects selected");
      return;
    }

    const payloadList: ElectiveSubjectPayload[] = [];
    selections.forEach((subjects, studentId) => {
      if (subjects.length > 0) {
        payloadList.push({
          studentId,
          className: selectedClass,
          stream: selectedStream,
          electiveSubjects: subjects,
        });
      }
    });

    if (payloadList.length === 0) {
      toast.error("No elective subjects selected");
      return;
    }

    saveMutation.mutate(payloadList);
  };

  // ─── Get selected count for a student ────────────────────────────────
  const getSelectedCount = useCallback(
    (studentId: number) => {
      return selections.get(studentId)?.length || 0;
    },
    [selections]
  );

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Elective Subject Selection
          </h1>
          <p className="text-slate-500 mt-1">
            Assign elective subjects to Grade 11 &amp; 12 students based on
            their chosen stream.
          </p>
        </div>

        {/* ── Info Card ──────────────────────────────────────────────── */}
        <Card className="bg-linear-to-br from-indigo-50 to-white border-indigo-100">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">
                    Common Subjects
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {COMMON_SUBJECTS.map((sub) => (
                      <Badge
                        key={sub}
                        variant="outline"
                        className="bg-teal-50 text-teal-700 border-teal-200"
                      >
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {selectedStream !== "__placeholder__" && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {selectedStream} Electives
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {electiveOptions.map((sub) => (
                        <Badge
                          key={sub}
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Controls ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-48">
            <Label className="text-sm font-medium text-slate-700 mb-1 block">
              Class
            </Label>
            <Select
              value={selectedClass}
              onValueChange={handleClassChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select class
                </SelectItem>
                {CLASSES_11_12.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Label className="text-sm font-medium text-slate-700 mb-1 block">
              Stream
            </Label>
            <Select
              value={selectedStream}
              onValueChange={handleStreamChange}
              disabled={selectedClass === "__placeholder__"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stream..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select stream
                </SelectItem>
                {Object.keys(STREAM_ELECTIVES).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 max-w-xs">
            <Label className="text-sm font-medium text-slate-700 mb-1 block">
              Search Student
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="Search by name or scholar no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
                disabled={selectedClass === "__placeholder__"}
              />
            </div>
          </div>

          <div className="pt-5">
            <Button
              onClick={handleSave}
              disabled={
                selectedClass === "__placeholder__" ||
                selectedStream === "__placeholder__" ||
                selections.size === 0 ||
                saveMutation.isPending
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Electives ({selections.size} student
                  {selections.size !== 1 ? "s" : ""})
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* ── Student Table ──────────────────────────────────────────── */}
        {selectedClass === "__placeholder__" ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">Select a class and stream</p>
            <p className="text-sm mt-1">
              Choose Grade 11 or Grade 12 and a stream to assign elective
              subjects.
            </p>
          </div>
        ) : isLoading || isFetching ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-6 w-6" />
            <span className="ml-2 text-slate-500">
              Loading students...
            </span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm mt-1">
              {searchTerm
                ? "Try a different search term."
                : `No students enrolled in ${selectedClass}.`}
            </p>
          </div>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-600" />
                    Students — {selectedClass} ({selectedStream})
                  </CardTitle>
                  <CardDescription>
                    Select elective subjects for each student. Common subjects
                    (Hindi, English) are auto-assigned.
                  </CardDescription>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 border-none text-sm px-3 py-1">
                  {filteredStudents.length} student
                  {filteredStudents.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="text-xs font-bold text-slate-500 uppercase w-12">
                        S.No
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase">
                        Student
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase">
                        Scholar No
                      </TableHead>
                      {electiveOptions.map((subject) => (
                        <TableHead
                          key={subject}
                          className="text-xs font-bold text-slate-500 uppercase text-center min-w-25"
                        >
                          {subject}
                        </TableHead>
                      ))}
                      <TableHead className="text-xs font-bold text-slate-500 uppercase text-center w-24">
                        Selected
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student: any, idx: number) => {
                      const studentId = student.id ?? student.studentId;
                      const selected = selections.get(studentId) || [];
                      const allSelected =
                        selected.length === electiveOptions.length;

                      return (
                        <TableRow
                          key={studentId}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <TableCell className="text-sm text-slate-500">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-900 text-sm">
                              {student.name || student.studentName}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {student.scholar_no || student.scholarNo || "-"}
                          </TableCell>
                          {electiveOptions.map((subject) => {
                            const isChecked = selected.includes(subject);
                            return (
                              <TableCell
                                key={subject}
                                className="text-center"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    toggleElective(studentId, subject)
                                  }
                                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <button
                              onClick={() => toggleAllForStudent(studentId)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                              title={
                                allSelected
                                  ? "Deselect all"
                                  : "Select all"
                              }
                            >
                              <Badge
                                variant="outline"
                                className={`cursor-pointer ${
                                  allSelected
                                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                    : selected.length > 0
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                {selected.length}/{electiveOptions.length}
                              </Badge>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

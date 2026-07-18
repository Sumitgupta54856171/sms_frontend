import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Save,
  GraduationCap,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import { fetchTeachers } from "@/api/teacher";
import type { TeacherResponse } from "@/api/teacher";
import { fetchTimetableByTeacher } from "@/api/timetable";
import type { PeriodEntry } from "@/api/timetable";
import { fetchStudentsByClass } from "@/api/student";
import {
  fetchMarks,
  saveExamMarks,
  saveTestMarks,
} from "@/api/grade";
import type { ExamGradePayload, TestGradePayload } from "@/api/grade";
import { getCookie } from "@/lib/utils";

// ─── Fetch test timetable by name ──────────────────────────────────────
const fetchTestTimetableByName = async (testName: string): Promise<any[]> => {
  try {
    const res = await fetch(`/api/v1/timetable/testByName/${encodeURIComponent(testName)}`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    return Array.isArray(data) ? data : data?.body ?? data?.data ?? [];
  } catch {
    return [];
  }
};

// ─── Fetch exam timetable by name ──────────────────────────────────────
const fetchExamTimetableByName = async (examName: string): Promise<any[]> => {
  try {
    const res = await fetch(`/api/v1/timetable/examByName/${encodeURIComponent(examName)}`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    const raw = data?.body ?? data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

// ─── Fetch test names ──────────────────────────────────────────────────
const fetchTestNames = async (): Promise<string[]> => {
  try {
    const res = await fetch("/api/v1/timetable/testName", {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    return data ?? [];
  } catch {
    return [];
  }
};

// ─── Fetch exam names ──────────────────────────────────────────────────
const fetchExamNames = async (): Promise<string[]> => {
  try {
    const res = await fetch("/api/v1/timetable/examName", {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    return data ?? [];
  } catch {
    return [];
  }
};

export default function GradePage() {
  const queryClient = useQueryClient();
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const sessionId = currentSession?.sessionId;

  const roleFromCookie = (getCookie("role") || "").replace(/^ROLE_/i, "");
  const isTeacher = roleFromCookie?.toLowerCase() === "teacher";
  const loggedInTeacherId = parseInt(localStorage.getItem("teacherId") || getCookie("teacherId") || "0");

  // ─── State ───────────────────────────────────────────────────────────
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    isTeacher ? String(loggedInTeacherId) : "__placeholder__"
  );
  const [activeTab, setActiveTab] = useState<"test" | "exam">("test");
  const [selectedExamName, setSelectedExamName] = useState("__placeholder__");
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState("__placeholder__");
  const [selectedSubject, setSelectedSubject] = useState("__placeholder__");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [savedStudentIds, setSavedStudentIds] = useState<Set<number>>(new Set());

  // ─── 1. Fetch all teachers (for admin) ───────────────────────────────
  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
    enabled: !isTeacher,
    staleTime: 5 * 60 * 1000,
  });

  // ─── 2. Fetch teacher's timetable periods ────────────────────────────
  const { data: teacherPeriodsData } = useQuery({
    queryKey: ["teacher-periods", selectedTeacherId],
    queryFn: () => fetchTimetableByTeacher(selectedTeacherId),
    enabled: selectedTeacherId !== "__placeholder__",
    staleTime: 5 * 60 * 1000,
  });

  // Build a Set of "class|subject" from teacher's periods
  const teacherClassSubjectMap = useMemo(() => {
    const map = new Map<string, string[]>(); // class → subjects[]
    if (!teacherPeriodsData) return map;
    
    teacherPeriodsData.forEach((p: PeriodEntry) => {
      if (p.gradeClass && p.subjectName) {
        const existing = map.get(p.gradeClass) || [];
        if (!existing.includes(p.subjectName)) {
          existing.push(p.subjectName);
        }
        map.set(p.gradeClass, existing);
      }
    });
    return map;
  }, [teacherPeriodsData]);

  // ─── 3. Fetch test/exam names ────────────────────────────────────────
  const { data: testNamesData } = useQuery({
    queryKey: ["grade-test-names"],
    queryFn: fetchTestNames,
    enabled: activeTab === "test",
  });

  const { data: examNamesData } = useQuery({
    queryKey: ["grade-exam-names"],
    queryFn: fetchExamNames,
    enabled: activeTab === "exam",
  });

  const examNameList = useMemo(() => {
    return activeTab === "test" ? (testNamesData || []) : (examNamesData || []);
  }, [activeTab, testNamesData, examNamesData]);

  // ─── 4. Fetch test/exam timetable entries by name ────────────────────
  const { data: timetableEntriesData } = useQuery({
    queryKey: ["timetable-entries", activeTab, selectedExamName],
    queryFn: () =>
      activeTab === "test"
        ? fetchTestTimetableByName(selectedExamName)
        : fetchExamTimetableByName(selectedExamName),
    enabled: selectedExamName !== "__placeholder__",
  });

  // ─── 5. Match: filter timetable entries where (classNO, subject) matches teacher's periods ───
  const matchedEntries = useMemo(() => {
    if (!timetableEntriesData || !timetableEntriesData.length) return [];

    return timetableEntriesData.filter((entry: any) => {
      const cls = entry.classNO ?? entry.classNo ?? entry.gradeClass ?? "";
      const sub = entry.subject ?? "";
      const teacherSubjects = teacherClassSubjectMap.get(cls);
      return teacherSubjects ? teacherSubjects.includes(sub) : false;
    });
  }, [timetableEntriesData, teacherClassSubjectMap]);

  // Extract unique classes from matched entries
  const matchedClasses = useMemo(() => {
    const classSet = new Set<string>();
    matchedEntries.forEach((e: any) => {
      const cls = e.classNO ?? e.classNo ?? e.gradeClass ?? "";
      if (cls) classSet.add(cls);
    });
    return Array.from(classSet).sort();
  }, [matchedEntries]);

  // Extract subjects for selected class from matched entries
  const subjectsForClass = useMemo(() => {
    if (selectedClass === "__placeholder__") return [];
    const subjectSet = new Set<string>();
    matchedEntries.forEach((e: any) => {
      const cls = e.classNO ?? e.classNo ?? e.gradeClass ?? "";
      if (cls === selectedClass && e.subject) {
        subjectSet.add(e.subject);
      }
    });
    return Array.from(subjectSet).sort();
  }, [matchedEntries, selectedClass]);

  // Get maxMarks for selected subject+class from matched entries
  const currentMaxMarks = useMemo(() => {
    if (selectedSubject === "__placeholder__" || selectedClass === "__placeholder__") return 100;
    const entry = matchedEntries.find((e: any) => {
      const cls = e.classNO ?? e.classNo ?? e.gradeClass ?? "";
      return cls === selectedClass && e.subject === selectedSubject;
    });
    return entry?.maxMarks ?? entry?.totalMarks ?? entry?.max_marks ?? 100;
  }, [matchedEntries, selectedClass, selectedSubject]);

  // Auto-set selectedExamId when subject is selected (find the matching entry's testtimetableId)
  useEffect(() => {
    if (selectedSubject !== "__placeholder__" && selectedClass !== "__placeholder__") {
      const entry = matchedEntries.find((e: any) => {
        const cls = e.classNO ?? e.classNo ?? e.gradeClass ?? "";
        return cls === selectedClass && e.subject === selectedSubject;
      });
      const id = entry?.testtimetableId ?? entry?.id ?? null;
      setSelectedExamId(id);
    } else {
      setSelectedExamId(null);
    }
  }, [matchedEntries, selectedClass, selectedSubject]);

  // ─── 6. Fetch students for selected class ────────────────────────────
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students-by-class", selectedClass],
    queryFn: () => fetchStudentsByClass(selectedClass),
    enabled: selectedClass !== "__placeholder__",
  });

  const students = useMemo(() => {
    if (!studentsData) return [];
    const raw = studentsData?.studentdetail ?? studentsData?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [studentsData]);

  // ─── 7. Fetch existing marks ─────────────────────────────────────────
  // GET /api/v1/grade/get/mark/{teacherId}/{subject}/{grade}/{type}/{examid}
  const { data: existingMarksData } = useQuery({
    queryKey: [
      "existing-marks",
      selectedTeacherId,
      selectedSubject,
      selectedClass,
      activeTab,
      selectedExamId,
    ],
    queryFn: () =>
      fetchMarks(
        selectedTeacherId,
        selectedSubject,
        selectedClass,
        activeTab,
        selectedExamId!
      ),
    enabled:
      selectedTeacherId !== "__placeholder__" &&
      selectedSubject !== "__placeholder__" &&
      selectedClass !== "__placeholder__" &&
      selectedExamId !== null &&
      selectedExamId > 0,
  });

  // Pre-fill marks from existing marks
  useEffect(() => {
    if (existingMarksData) {
      if (existingMarksData.length > 0) {
        const newMarks: Record<string, string> = {};
        const savedIds = new Set<number>();
        existingMarksData.forEach((g: any) => {
          const sid = g.studentId ?? g.student_id;
          if (sid && g.mark !== null && g.mark !== undefined) {
            newMarks[String(sid)] = String(g.mark);
            savedIds.add(sid);
          }
        });
        setMarks((prev) => ({ ...prev, ...newMarks }));
        setSavedStudentIds(savedIds);
      } else {
        setMarks({});
        setSavedStudentIds(new Set());
      }
    }
  }, [existingMarksData]);

  // ─── Save mutation ───────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (entries: { studentId: number; mark: number }[]) => {
      if (!selectedExamId) throw new Error("No exam/test selected");

      if (activeTab === "exam") {
        const payloads: ExamGradePayload[] = entries.map((e) => ({
          studentId: e.studentId,
          teacherId: parseInt(selectedTeacherId),
          subject: selectedSubject,
          sessionId: sessionId ?? null,
          classNo: selectedClass,
          mark: e.mark,
          examTimeTable: { testtimetableId: selectedExamId },
        }));
        await saveExamMarks(payloads);
      } else {
        const payloads: TestGradePayload[] = entries.map((e) => ({
          studentId: e.studentId,
          teacherId: parseInt(selectedTeacherId),
          subject: selectedSubject,
          sessionId: sessionId ?? null,
          classNo: selectedClass,
          mark: e.mark,
          testTimetable: { testtimetableId: selectedExamId },
        }));
        await saveTestMarks(payloads);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["existing-marks"],
      });
      toast.success("Marks saved successfully");
    },
    onError: () => toast.error("Failed to save marks"),
  });

  // ─── Handlers that reset downstream state ────────────────────────────
  const handleTeacherChange = useCallback((value: string) => {
    setSelectedTeacherId(value);
    setSelectedExamName("__placeholder__");
    setSelectedExamId(null);
    setSelectedClass("__placeholder__");
    setSelectedSubject("__placeholder__");
    setMarks({});
    setSavedStudentIds(new Set());
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "test" | "exam");
    setSelectedExamName("__placeholder__");
    setSelectedExamId(null);
    setSelectedClass("__placeholder__");
    setSelectedSubject("__placeholder__");
    setMarks({});
    setSavedStudentIds(new Set());
  }, []);

  const handleExamNameChange = useCallback((value: string) => {
    setSelectedExamName(value);
    setSelectedExamId(null);
    setSelectedClass("__placeholder__");
    setSelectedSubject("__placeholder__");
    setMarks({});
    setSavedStudentIds(new Set());
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value);
    setSelectedExamId(null);
    setSelectedSubject("__placeholder__");
    setMarks({});
    setSavedStudentIds(new Set());
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSelectedSubject(value);
    setMarks({});
    setSavedStudentIds(new Set());
  }, []);

  // ─── Handle mark change ──────────────────────────────────────────────
  const handleMarkChange = useCallback((studentId: number, value: string) => {
    setMarks((prev) => ({ ...prev, [String(studentId)]: value }));
  }, []);

  // ─── Handle save ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (
      selectedClass === "__placeholder__" ||
      selectedSubject === "__placeholder__" ||
      selectedExamName === "__placeholder__"
    ) {
      toast.error("Please select class, subject, and exam name");
      return;
    }
    if (!selectedExamId) {
      toast.error("No exam/test ID found. Please re-select the exam/test.");
      return;
    }

    const entries = students
      .filter((s: any) => {
        const sid = s.id ?? s.studentId ?? s.student_id;
        return marks[String(sid)] !== undefined && marks[String(sid)] !== "";
      })
      .map((s: any) => {
        const sid = s.id ?? s.studentId ?? s.student_id;
        return {
          studentId: sid,
          mark: parseFloat(marks[String(sid)]) || 0,
        };
      });

    if (entries.length === 0) {
      toast.error("No marks entered. Please fill in marks before saving.");
      return;
    }

    saveMutation.mutate(entries);
  };

  // ─── Can show marks entry? ───────────────────────────────────────────
  const canShowMarksEntry =
    selectedClass !== "__placeholder__" &&
    selectedSubject !== "__placeholder__" &&
    selectedExamName !== "__placeholder__";

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-teal-600" />
            Grade Entry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a teacher, then choose test/exam to fill marks
          </p>
        </div>
      </div>

      {/* Step-by-step Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Step 1: Teacher */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 1 — Teacher
              </Label>
              <Select
                value={selectedTeacherId}
                onValueChange={handleTeacherChange}
                disabled={isTeacher}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">
                    Select teacher
                  </SelectItem>
                  {isTeacher ? (
                    <SelectItem value={String(loggedInTeacherId)}>My Profile</SelectItem>
                  ) : (
                    (teachersData || []).map((t: TeacherResponse) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isTeacher && (
                <p className="text-xs text-teal-600 font-medium">
                  Logged in as teacher
                </p>
              )}
            </div>

            {/* Step 2: Test/Exam Type */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 2 — Type
              </Label>
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="test" className="flex-1">Test</TabsTrigger>
                  <TabsTrigger value="exam" className="flex-1">Exam</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Step 3: Test/Exam Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 3 — {activeTab === "test" ? "Test" : "Exam"} Name
              </Label>
              <Select
                value={selectedExamName}
                onValueChange={handleExamNameChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${activeTab}...`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">
                    Select {activeTab}
                  </SelectItem>
                  {examNameList.map((name: string) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 4: Class (from matched entries) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 4 — Class
              </Label>
              <Select
                value={selectedClass}
                onValueChange={handleClassChange}
                disabled={selectedExamName === "__placeholder__" || matchedClasses.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedExamName === "__placeholder__"
                        ? "Select exam first"
                        : matchedClasses.length === 0
                        ? "No matching classes"
                        : "Select class..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">
                    Select class
                  </SelectItem>
                  {matchedClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 5: Subject (if multiple for this class) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 5 — Subject
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={handleSubjectChange}
                disabled={selectedClass === "__placeholder__" || subjectsForClass.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedClass === "__placeholder__"
                        ? "Select class first"
                        : subjectsForClass.length === 0
                        ? "No subjects"
                        : subjectsForClass.length === 1
                        ? subjectsForClass[0]
                        : "Select subject..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">
                    Select subject
                  </SelectItem>
                  {subjectsForClass.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subjectsForClass.length === 1 && selectedClass !== "__placeholder__" && selectedSubject === "__placeholder__" && (
                <p className="text-xs text-slate-400">
                  Only one subject available — auto-selected on continue
                </p>
              )}
            </div>
          </div>

          {/* Auto-select subject if only one */}
          {subjectsForClass.length === 1 && selectedSubject === "__placeholder__" && (
            <div className="mt-3 text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSubjectChange(subjectsForClass[0])}
                className="gap-1"
              >
                Use {subjectsForClass[0]}
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {canShowMarksEntry ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-600" />
                {selectedSubject}
                <Badge variant="secondary" className="text-xs font-normal">
                  {selectedExamName}
                </Badge>
              </CardTitle>
              <CardDescription>
                Class: {selectedClass} | Max Marks: {currentMaxMarks}
              </CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveMutation.isPending ? "Saving..." : "Save All Marks"}
            </Button>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No students found</p>
                <p className="text-xs mt-1">
                  No students are enrolled in {selectedClass}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-20 text-center">Roll No.</TableHead>
                      <TableHead className="w-28 text-center">Scholar No.</TableHead>
                      <TableHead className="w-36 text-center">
                        Marks (out of {currentMaxMarks})
                      </TableHead>
                      <TableHead className="w-20 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s: any, idx: number) => {
                      const sid = s.id ?? s.studentId ?? s.student_id;
                      const name =
                        s.name ??
                        s.fullName ??
                        s.studentName ??
                        `Student #${sid}`;
                      const roll =
                        s.roll_no ??
                        s.rollNo ??
                        s.rollNumber ??
                        s.rolNo ??
                        "-";
                      const scholar =
                        s.scholar_no ??
                        s.scholarNo ??
                        s.scholar_number ??
                        "-";
                      const markValue = marks[String(sid)] ?? "";
                      const isSaved = savedStudentIds.has(sid);

                      return (
                        <TableRow key={sid}>
                          <TableCell className="text-center text-slate-400 text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-teal-50 text-teal-700 text-xs">
                                  {name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-slate-500 text-sm">
                            {roll}
                          </TableCell>
                          <TableCell className="text-center text-slate-500 text-sm font-mono">
                            {scholar}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={currentMaxMarks}
                                step="0.5"
                                value={markValue}
                                onChange={(e) =>
                                  handleMarkChange(sid, e.target.value)
                                }
                                className="w-20 text-center h-9 text-sm"
                                placeholder="--"
                              />
                              <span className="text-xs text-slate-400">
                                / {currentMaxMarks}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {isSaved && markValue ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Saved
                              </Badge>
                            ) : markValue ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs"
                              >
                                <AlertCircle className="h-3 w-3" />
                                New
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center text-slate-400">
              <ClipboardCheck className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-slate-500 mb-1">
                Select All Filters to Begin
              </h3>
              <p className="text-sm max-w-md mx-auto">
                Follow the steps above: select a teacher, choose test/exam type,
                pick the exam name, then select a class and subject to start
                entering marks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
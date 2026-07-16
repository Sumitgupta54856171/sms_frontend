import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/AuthProvider";
import { useAppSelector } from "@/store/hooks";
import {
  fetchExamNames,
  fetchExamTimetableByName,
  saveExamTimetableEntry,
  bulkSaveExamTimetableEntries,
  deleteExamTimetableEntry,
} from "@/api/exam-timetable";
import type { ExamTimetableEntry } from "@/api/exam-timetable";
import {
  saveTestTimetable,
  fetchTestNames,
  fetchTestTimetableByName,
} from "@/api/test-timetable";
import TimetableFilters from "./TimetableFilters";
import TimetableFormModal from "./TimetableFormModal";
import TimetableTable from "./TimetableTable";
import { getCookie } from "@/lib/utils";
import { fetchTeacherClass } from "@/api/teacher";

export default function ExamTimetablePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const sessionId = currentSession?.sessionId;

  // Use cookie for instant role detection
  const roleFromCookie = (getCookie("role") || "").replace(/^ROLE_/i, "");
  const isTeacher = roleFromCookie?.toLowerCase() === "teacher";

  // Fetch teacher's class via useQuery
  const { data: teacherClassName = "" } = useQuery({
    queryKey: ["teacher-class"],
    queryFn: fetchTeacherClass,
    enabled: isTeacher,
    staleTime: 5 * 60 * 1000,
  });

  const [activeTab, setActiveTab] = useState<"test" | "exam">("test");
  const [selectedGrade, setSelectedGrade] = useState(
    isTeacher ? "__placeholder__" : "__placeholder__"
  );
  const [selectedExamName, setSelectedExamName] = useState("__placeholder__");

  // Sync teacher's class once fetched
  useEffect(() => {
    if (isTeacher && teacherClassName) {
      setSelectedGrade(teacherClassName);
    }
  }, [isTeacher, teacherClassName]);

  // ─── Add/Edit modal state ────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExamTimetableEntry | null>(null);
  const [formExamType, setFormExamType] = useState<"test" | "exam">("test");
  const [formExamName, setFormExamName] = useState("");
  const [formTestCode, setFormTestCode] = useState("");
  const [formTotalMarks, setFormTotalMarks] = useState("");
  const [formGrade, setFormGrade] = useState("__placeholder__");
  const [formGrades, setFormGrades] = useState<string[]>([]);
  const [formSubject, setFormSubject] = useState("__placeholder__");
  const [formDate, setFormDate] = useState("");
  const [formDay, setFormDay] = useState("__placeholder__");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");

  // ─── Fetch names (test or exam) ──────────────────────────────────────
  const { data: testNamesFromApi = [] } = useQuery({
    queryKey: ["test-names"],
    queryFn: fetchTestNames,
    enabled: activeTab === "test",
  });

  const { data: examNamesFromApi = [] } = useQuery({
    queryKey: ["exam-names"],
    queryFn: fetchExamNames,
    enabled: activeTab === "exam",
  });

  // ─── Fetch entries by selected name ──────────────────────────────────
  const { data: testByNameEntries = [], isLoading: testByNameLoading } = useQuery({
    queryKey: ["test-timetable-by-name", selectedExamName],
    queryFn: () => fetchTestTimetableByName(selectedExamName),
    enabled: activeTab === "test" && selectedExamName !== "__placeholder__",
  });

  const { data: examByNameEntries = [], isLoading: examByNameLoading } = useQuery({
    queryKey: ["exam-timetable-by-name", selectedExamName],
    queryFn: () => fetchExamTimetableByName(selectedExamName),
    enabled: activeTab === "exam" && selectedExamName !== "__placeholder__",
  });

  // ─── Unique exam/test names ──────────────────────────────────────────
  const examNames = useMemo(() => {
    if (activeTab === "test") {
      const names = Array.isArray(testNamesFromApi) ? testNamesFromApi : [];
      return names.length > 0 ? names : [];
    }
    const names = Array.isArray(examNamesFromApi) ? examNamesFromApi : [];
    return names.length > 0 ? names : [];
  }, [activeTab, testNamesFromApi, examNamesFromApi]);

  // ─── Filter by grade + exam name ─────────────────────────────────────
  const filteredEntries = useMemo(() => {
    if (selectedExamName === "__placeholder__") return [];

    const source = activeTab === "test" ? testByNameEntries : examByNameEntries;

    let list = source.map((e: any) => ({
      testtimetableId: e.testtimetableId,
      timetableName: e.timetableName,
      examType: activeTab as "test" | "exam",
      classNO: e.classNO,
      subject: e.subject,
      date: e.date,
      day: e.day,
      examcode: e.examcode ?? e.testcode,
      maxMarks: e.maxMarks,
      startTime: e.startTime || "",
      endTime: e.endTime || "",
      sessionId: e.sessionId,
    }));

    if (selectedGrade && selectedGrade !== "__placeholder__") {
      list = list.filter((e: any) => e.classNO === selectedGrade);
    }
    return list;
  }, [selectedGrade, selectedExamName, activeTab, testByNameEntries, examByNameEntries]);

  const isLoading =
    selectedExamName !== "__placeholder__"
      ? activeTab === "test" ? testByNameLoading : examByNameLoading
      : false;

  // ─── Group by date for display ───────────────────────────────────────
  const groupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const sorted = [...filteredEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (const entry of sorted) {
      const key = entry.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  // ─── Invalidate both name lists ──────────────────────────────────────
  const invalidateNames = () => {
    queryClient.invalidateQueries({ queryKey: ["test-names"] });
    queryClient.invalidateQueries({ queryKey: ["exam-names"] });
  };

  // ─── Delete mutation ─────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteExamTimetableEntry,
    onSuccess: () => {
      invalidateNames();
      toast.success("Entry deleted successfully");
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  // ─── Save mutation (single) ──────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: saveExamTimetableEntry,
    onSuccess: () => {
      invalidateNames();
      toast.success(editingEntry ? "Entry updated successfully" : "Entry added successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to save entry"),
  });

  // ─── Bulk save mutation (exam) ───────────────────────────────────────
  const bulkSaveMutation = useMutation({
    mutationFn: bulkSaveExamTimetableEntries,
    onSuccess: (data) => {
      invalidateNames();
      const count = data?.length ?? formGrades.length;
      toast.success(`${count} entries created successfully`);
      resetForm();
    },
    onError: () => toast.error("Failed to create bulk entries"),
  });

  // ─── Save test timetable mutation ────────────────────────────────────
  const saveTestMutation = useMutation({
    mutationFn: saveTestTimetable,
    onSuccess: () => {
      invalidateNames();
      toast.success("Test timetable saved successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to save test timetable"),
  });

  // ─── Toggle grade selection for multi-select ─────────────────────────
  const toggleGrade = (grade: string) => {
    setFormGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  // ─── Reset form ──────────────────────────────────────────────────────
  const resetForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setFormExamName("");
    setFormTestCode("");
    setFormTotalMarks("");
    setFormGrade("__placeholder__");
    setFormGrades([]);
    setFormSubject("__placeholder__");
    setFormDate("");
    setFormDay("__placeholder__");
    setFormStartTime("");
    setFormEndTime("");
  };

  // ─── Open edit form ──────────────────────────────────────────────────
  const openEditForm = (entry: any) => {
    setEditingEntry(entry);
    setFormExamName(entry.timetableName ?? entry.examName);
    setFormExamType(entry.examType);
    setFormTestCode(entry.examcode?.toString() ?? entry.testCode?.toString() ?? "");
    setFormTotalMarks(entry.maxMarks?.toString() ?? entry.totalMarks?.toString() ?? "");
    setFormGrade(entry.classNO ?? entry.gradeClass);
    setFormGrades([]);
    setFormSubject(entry.subject);
    setFormDate(entry.date);
    setFormDay(entry.day || "__placeholder__");
    setFormStartTime(entry.startTime || "");
    setFormEndTime(entry.endTime || "");
    setShowForm(true);
  };

  // ─── Handle form submit ──────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExamName.trim()) {
      toast.error("Please enter an exam/test name");
      return;
    }
    if (formSubject === "__placeholder__") {
      toast.error("Please select a subject");
      return;
    }
    if (!formDate) {
      toast.error("Please select a date");
      return;
    }
    if (formDay === "__placeholder__") {
      toast.error("Please select a day");
      return;
    }

    // ── Test timetable: use dedicated test API ──────────────────────────
    if (formExamType === "test") {
      const testCodeNum = formTestCode.trim()
        ? parseInt(formTestCode.trim())
        : undefined;

      if (!editingEntry && formGrades.length > 0) {
        // Bulk: send all entries as a timetable array
        const entries = formGrades.map((g) => ({
          timetableName: formExamName.trim(),
          classNO: g,
          subject: formSubject,
          day: formDay,
          date: formDate,
          testcode: testCodeNum,
          sessionId: sessionId ?? undefined,
          maxMarks: formTotalMarks ? parseInt(formTotalMarks) : undefined,
        }));
        saveTestMutation.mutate(entries, {
          onSuccess: () => {
            invalidateNames();
            toast.success(`${entries.length} test entries created successfully`);
            resetForm();
          },
          onError: () => toast.error("Failed to save test entries"),
        });
        return;
      }

      // Single test
      if (!editingEntry && formGrade === "__placeholder__") {
        toast.error("Please select a grade");
        return;
      }
      saveTestMutation.mutate(
        {
          ...(editingEntry?.testtimetableId
            ? { testtimetableId: editingEntry.testtimetableId }
            : {}),
          timetableName: formExamName.trim(),
          classNO: formGrade,
          subject: formSubject,
          day: formDay,
          date: formDate,
          testcode: testCodeNum,
          sessionId: sessionId ?? undefined,
          maxMarks: formTotalMarks ? parseInt(formTotalMarks) : undefined,
        },
        {
          onSuccess: () => {
            invalidateNames();
            toast.success("Test timetable saved successfully");
            resetForm();
          },
          onError: () => toast.error("Failed to save test timetable"),
        }
      );
      return;
    }

    // ── Exam timetable: use existing exam API ───────────────────────────
    if (!editingEntry && formGrades.length > 0) {
      if (!formStartTime || !formEndTime) {
        toast.error("Please select start and end time");
        return;
      }
      const entries = formGrades.map((g) => ({
        timetableName: formExamName.trim(),
        examType: formExamType,
        classNO: g,
        subject: formSubject,
        date: formDate,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        maxMarks: formTotalMarks ? parseInt(formTotalMarks) : undefined,
        examcode: formTestCode.trim() ? parseInt(formTestCode.trim()) : undefined,
        sessionId: sessionId ?? undefined,
      }));
      bulkSaveMutation.mutate(entries);
      return;
    }

    if (!editingEntry && formGrade === "__placeholder__") {
      toast.error("Please select a grade");
      return;
    }
    if (!formStartTime || !formEndTime) {
      toast.error("Please select start and end time");
      return;
    }

    saveMutation.mutate({
      ...(editingEntry?.testtimetableId ? { testtimetableId: editingEntry.testtimetableId } : {}),
      timetableName: formExamName.trim(),
      examType: formExamType,
      classNO: formGrade,
      subject: formSubject,
      date: formDate,
      day: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      maxMarks: formTotalMarks ? parseInt(formTotalMarks) : undefined,
      examcode: formTestCode.trim() ? parseInt(formTestCode.trim()) : undefined,
      sessionId: sessionId ?? undefined,
    });
  };

  // ─── Handle delete ───────────────────────────────────────────────────
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // ─── Handle add new ──────────────────────────────────────────────────
  const handleAddNew = () => {
    resetForm();
    setFormExamType(activeTab as "test" | "exam");
    setShowForm(true);
  };

  const isSaving =
    saveMutation.isPending || bulkSaveMutation.isPending || saveTestMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                Exam & Test Timetable
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                View and manage schedules for tests and examinations
              </p>
            </div>
          </div>

          {isAuthenticated && !isTeacher && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  resetForm();
                  setFormExamType("test");
                  setShowForm(true);
                }}
                variant="outline"
                className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Plus className="h-4 w-4" />
                Add Test
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setFormExamType("exam");
                  setShowForm(true);
                }}
                className="gap-2 bg-[#0d9488] hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                Add Exam
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "test" | "exam")}>
          <TabsList className="bg-white border border-slate-200 mb-6">
            <TabsTrigger value="test" className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="exam" className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="mt-0">
            <div className="space-y-6">
              <TimetableFilters
                selectedGrade={selectedGrade}
                selectedExamName={selectedExamName}
                examNames={examNames}
                activeTab={activeTab}
                isTeacher={isTeacher}
                teacherClassName={teacherClassName}
                onGradeChange={setSelectedGrade}
                onExamNameChange={setSelectedExamName}
                onClear={() => {
                  setSelectedGrade(isTeacher && teacherClassName ? teacherClassName : "__placeholder__");
                  setSelectedExamName("__placeholder__");
                }}
              />
              <TimetableTable
                groupedByDate={groupedByDate}
                activeTab={activeTab}
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                filteredEntries={filteredEntries}
                selectedGrade={selectedGrade}
                selectedExamName={selectedExamName}
                isTeacher={isTeacher}
                onAddNew={handleAddNew}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            </div>
          </TabsContent>
          <TabsContent value="exam" className="mt-0">
            <div className="space-y-6">
              <TimetableFilters
                selectedGrade={selectedGrade}
                selectedExamName={selectedExamName}
                examNames={examNames}
                activeTab={activeTab}
                isTeacher={isTeacher}
                teacherClassName={teacherClassName}
                onGradeChange={setSelectedGrade}
                onExamNameChange={setSelectedExamName}
                onClear={() => {
                  setSelectedGrade(isTeacher && teacherClassName ? teacherClassName : "__placeholder__");
                  setSelectedExamName("__placeholder__");
                }}
              />
              <TimetableTable
                groupedByDate={groupedByDate}
                activeTab={activeTab}
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                filteredEntries={filteredEntries}
                selectedGrade={selectedGrade}
                selectedExamName={selectedExamName}
                isTeacher={isTeacher}
                onAddNew={handleAddNew}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Modal */}
      <TimetableFormModal
        showForm={showForm}
        editingEntry={editingEntry}
        formExamType={formExamType}
        formExamName={formExamName}
        formTestCode={formTestCode}
        formTotalMarks={formTotalMarks}
        formGrade={formGrade}
        formGrades={formGrades}
        formSubject={formSubject}
        formDate={formDate}
        formDay={formDay}
        formStartTime={formStartTime}
        formEndTime={formEndTime}
        isSaving={isSaving}
        onReset={resetForm}
        onExamNameChange={setFormExamName}
        onTestCodeChange={setFormTestCode}
        onTotalMarksChange={setFormTotalMarks}
        onGradeChange={setFormGrade}
        onGradeToggle={toggleGrade}
        onSubjectChange={setFormSubject}
        onDateChange={setFormDate}
        onDayChange={setFormDay}
        onStartTimeChange={setFormStartTime}
        onEndTimeChange={setFormEndTime}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

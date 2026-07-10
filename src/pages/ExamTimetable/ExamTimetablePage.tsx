import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Clock,
  GraduationCap,
  FileText,
  X,
  Hash,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/AuthProvider";
import {
  fetchAllExamTimetables,
  saveExamTimetableEntry,
  bulkSaveExamTimetableEntries,
  deleteExamTimetableEntry,
} from "@/api/exam-timetable";
import type { ExamTimetableEntry } from "@/api/exam-timetable";

const GRADES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "Hindi",
  "Sanskrit",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Accountancy",
  "Business Studies",
  "Physical Education",
  "Art & Craft",
  "Music",
  "Moral Science",
  "General Knowledge",
  "Environmental Studies",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatTime = (time: string) => {
  if (!time) return "";
  try {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  } catch {
    return time;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
};

export default function ExamTimetablePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [activeTab, setActiveTab] = useState("test");
  const [selectedGrade, setSelectedGrade] = useState("__placeholder__");
  const [selectedExamName, setSelectedExamName] = useState("__placeholder__");

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

  // ─── Data ────────────────────────────────────────────────────────────
  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: ["exam-timetable"],
    queryFn: fetchAllExamTimetables,
  });

  // ─── Filter by type ──────────────────────────────────────────────────
  const typeEntries = useMemo(
    () => allEntries.filter((e: ExamTimetableEntry) => e.examType === activeTab),
    [allEntries, activeTab]
  );

  // ─── Unique exam names for the selected type ─────────────────────────
  const examNames = useMemo(() => {
    const names = new Set(typeEntries.map((e: ExamTimetableEntry) => e.examName));
    return Array.from(names).filter(Boolean);
  }, [typeEntries]);

  // ─── Filter by grade + exam name ─────────────────────────────────────
  const filteredEntries = useMemo(() => {
    let list = typeEntries;
    if (selectedGrade && selectedGrade !== "__placeholder__") {
      list = list.filter((e: ExamTimetableEntry) => e.gradeClass === selectedGrade);
    }
    if (selectedExamName && selectedExamName !== "__placeholder__") {
      list = list.filter((e: ExamTimetableEntry) => e.examName === selectedExamName);
    }
    return list;
  }, [typeEntries, selectedGrade, selectedExamName]);

  // ─── Group by date for display ───────────────────────────────────────
  const groupedByDate = useMemo(() => {
    const groups: Record<string, ExamTimetableEntry[]> = {};
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

  // ─── Delete mutation ─────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteExamTimetableEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-timetable"] });
      toast.success("Entry deleted successfully");
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  // ─── Save mutation (single) ──────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: saveExamTimetableEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-timetable"] });
      toast.success(editingEntry ? "Entry updated successfully" : "Entry added successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to save entry"),
  });

  // ─── Bulk save mutation ──────────────────────────────────────────────
  const bulkSaveMutation = useMutation({
    mutationFn: bulkSaveExamTimetableEntries,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exam-timetable"] });
      const count = data?.length ?? formGrades.length;
      toast.success(`${count} entries created successfully`);
      resetForm();
    },
    onError: () => toast.error("Failed to create bulk entries"),
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
  const openEditForm = (entry: ExamTimetableEntry) => {
    setEditingEntry(entry);
    setFormExamName(entry.examName);
    setFormExamType(entry.examType);
    setFormTestCode(entry.testCode ?? "");
    setFormTotalMarks(entry.totalMarks?.toString() ?? "");
    setFormGrade(entry.gradeClass);
    setFormGrades([]);
    setFormSubject(entry.subject);
    setFormDate(entry.date);
    setFormDay("__placeholder__");
    setFormStartTime(entry.startTime);
    setFormEndTime(entry.endTime);
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

    // Multi-class bulk mode (both test and exam)
    if (!editingEntry && formGrades.length > 0) {
      if (formExamType === "exam" && (!formStartTime || !formEndTime)) {
        toast.error("Please select start and end time");
        return;
      }
      const entries = formGrades.map((g) => ({
        examName: formExamName.trim(),
        examType: formExamType,
        gradeClass: g,
        subject: formSubject,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        totalMarks: formTotalMarks ? parseInt(formTotalMarks) : undefined,
        testCode: formTestCode.trim() || undefined,
      }));
      bulkSaveMutation.mutate(entries);
      return;
    }

    // Single grade (test or editing)
    if (!editingEntry && formGrade === "__placeholder__") {
      toast.error("Please select a grade");
      return;
    }
    if (formExamType === "exam" && (!formStartTime || !formEndTime)) {
      toast.error("Please select start and end time");
      return;
    }

    saveMutation.mutate({
      ...(editingEntry?.id ? { id: editingEntry.id } : {}),
      examName: formExamName.trim(),
      examType: formExamType,
      gradeClass: formGrade,
      subject: formSubject,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      totalMarks: formTotalMarks ? parseInt(formTotalMarks) : undefined,
      testCode: formTestCode.trim() || undefined,
    });
  };

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

          {isAuthenticated && (
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
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Exam
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            {renderContent()}
          </TabsContent>
          <TabsContent value="exam" className="mt-0">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingEntry
                  ? "Edit Schedule"
                  : formExamType === "test"
                  ? "Add Test Schedule"
                  : "Add Exam Schedule"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* ── Test / Exam Name ── */}
              <div>
                <Label className="mb-1.5 block">
                  {formExamType === "test" ? "Test Name" : "Exam Name"}
                </Label>
                <Input
                  value={formExamName}
                  onChange={(e) => setFormExamName(e.target.value)}
                  placeholder={`e.g. ${formExamType === "test" ? "Weekly Test 1" : "Half Yearly"}`}
                />
              </div>

              {/* ── Test / Exam Code ── */}
              <div>
                <Label className="mb-1.5 block">Test / Exam Code</Label>
                <Input
                  value={formTestCode}
                  onChange={(e) => setFormTestCode(e.target.value)}
                  placeholder="e.g. T-001 or MID-2026"
                />
              </div>

              {/* ── Subject ── */}
              <div>
                <Label className="mb-1.5 block">Subject</Label>
                <Select value={formSubject} onValueChange={setFormSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__" className="hidden">
                      Select subject
                    </SelectItem>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Grade / Class ── */}
              {!editingEntry ? (
                /* Multi-class selection for bulk creation */
                <div>
                  <Label className="mb-1.5 block">Select Classes (bulk create)</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {GRADES.map((g) => (
                      <label
                        key={g}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                          formGrades.includes(g)
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formGrades.includes(g)}
                          onChange={() => toggleGrade(g)}
                          className="sr-only"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                  {formGrades.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      {formGrades.length} class{formGrades.length > 1 ? "es" : ""} selected
                    </p>
                  )}
                </div>
              ) : (
                /* Single grade selection for test or editing */
                <div>
                  <Label className="mb-1.5 block">Grade / Class</Label>
                  <Select
                    value={formGrade}
                    onValueChange={setFormGrade}
                    disabled={!!editingEntry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__placeholder__" className="hidden">
                        Select grade
                      </SelectItem>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* ── Day ── */}
              <div>
                <Label className="mb-1.5 block">Day</Label>
                <Select value={formDay} onValueChange={setFormDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__" className="hidden">
                      Select day
                    </SelectItem>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Date ── */}
              <div>
                <Label className="mb-1.5 block">Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              {/* ── Start & End Time (exam only) ── */}
              {formExamType === "exam" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Start Time</Label>
                    <Input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">End Time</Label>
                    <Input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ── Total Marks ── */}
              <div>
                <Label className="mb-1.5 block">Total Marks</Label>
                <Input
                  type="number"
                  min="0"
                  value={formTotalMarks}
                  onChange={(e) => setFormTotalMarks(e.target.value)}
                  placeholder="e.g. 100"
                />
              </div>

              {/* ── Submit ── */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={saveMutation.isPending || bulkSaveMutation.isPending}
                >
                  {saveMutation.isPending || bulkSaveMutation.isPending
                    ? "Saving..."
                    : editingEntry
                    ? "Update Schedule"
                    : formExamType === "exam" && formGrades.length > 1
                    ? `Create ${formGrades.length} Entries`
                    : "Add Schedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderContent() {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-48">
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__">All Grades</SelectItem>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-56">
                <Select value={selectedExamName} onValueChange={setSelectedExamName}>
                  <SelectTrigger>
                    <SelectValue placeholder="All names" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__">
                      {activeTab === "test" ? "All Tests" : "All Exams"}
                    </SelectItem>
                    {examNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedGrade !== "__placeholder__" || selectedExamName !== "__placeholder__") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGrade("__placeholder__");
                    setSelectedExamName("__placeholder__");
                  }}
                  className="text-xs text-slate-500"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timetable Display */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No schedules found</p>
            <p className="text-xs mt-1">
              {selectedGrade !== "__placeholder__" || selectedExamName !== "__placeholder__"
                ? "Try changing the filters."
                : `No ${activeTab} schedules have been created yet.`}
            </p>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                  setFormExamType(activeTab as "test" | "exam");
                  setShowForm(true);
                }}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add {activeTab === "test" ? "Test" : "Exam"} Schedule
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, entries]) => (
              <Card key={date}>
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    {formatDate(date)}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {entries.length} subject{entries.length !== 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs font-bold text-slate-500 uppercase">
                            Subject
                          </TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase">
                            Grade
                          </TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase">
                            {activeTab === "test" ? "Test" : "Exam"}
                          </TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase">
                            Code
                          </TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase">
                            Marks
                          </TableHead>
                          {activeTab === "exam" && (
                            <TableHead className="text-xs font-bold text-slate-500 uppercase">
                              Time
                            </TableHead>
                          )}
                          {isAuthenticated && (
                            <TableHead className="w-20 text-xs font-bold text-slate-500 uppercase">
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry: ExamTimetableEntry, idx: number) => (
                          <TableRow
                            key={entry.id ?? idx}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-sm font-medium text-slate-800">
                                  {entry.subject}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                {entry.gradeClass}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-600">
                                {entry.examName}
                              </span>
                            </TableCell>
                            <TableCell>
                              {entry.testCode ? (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-xs">
                                  <Hash className="h-3 w-3 mr-0.5" />
                                  {entry.testCode}
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {entry.totalMarks ? (
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                  <Award className="h-3.5 w-3.5 text-amber-500" />
                                  {entry.totalMarks}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </TableCell>
                            {activeTab === "exam" && (
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm text-slate-600 whitespace-nowrap">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {entry.startTime ? formatTime(entry.startTime) : "—"}
                                  {entry.endTime ? ` — ${formatTime(entry.endTime)}` : ""}
                                </div>
                              </TableCell>
                            )}
                            {isAuthenticated && (
                              <TableCell>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openEditForm(entry)}
                                    className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (entry.id) deleteMutation.mutate(entry.id);
                                    }}
                                    className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
}

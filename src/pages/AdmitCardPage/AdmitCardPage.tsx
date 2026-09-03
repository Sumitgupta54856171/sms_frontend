import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, FileText, LayoutGrid, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  fetchExamNames,
  fetchExamTimetableByName,
  fetchAdmitCardStudents,
} from "@/api/admit-card";
import { useAppSelector } from "@/store/hooks";
import AdmitCard from "@/components/AdmitCard";
import AdmitCardBulkTemplate from "@/components/AdmitCardBulkTemplate";
import type { AdmitCardStudentInfo } from "@/components/AdmitCard";
import type { ExamTimetableEntry } from "@/api/admit-card";

const ALL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

export default function AdmitCardPage() {
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulk, setShowBulk] = useState(false);

  const currentSession = useAppSelector((s) => s.session.currentSession);
  const sessionName = currentSession?.sessionName ?? "";

  // ─── 1. Fetch exam names ─────────────────────────────────────────────
  const { data: examNames = [], isLoading: examsLoading } = useQuery({
    queryKey: ["exam-names"],
    queryFn: fetchExamNames,
  });

  // ─── 2. Fetch timetable for selected exam ────────────────────────────
  const { data: timetable = [], isLoading: timetableLoading } = useQuery({
    queryKey: ["exam-timetable", selectedExam],
    queryFn: () => fetchExamTimetableByName(selectedExam),
    enabled: !!selectedExam,
  });

  // ─── 3. Fetch students for selected class ────────────────────────────
  const classNumber = selectedClass.replace(/^Grade\s*/i, "");
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["admit-card-students", classNumber],
    queryFn: () => fetchAdmitCardStudents(classNumber),
    enabled: !!selectedClass,
  });

  // ─── 4. Filter students by search ────────────────────────────────────
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.fatherName.toLowerCase().includes(term) ||
        s.rollNo.toLowerCase().includes(term) ||
        s.scholarNo.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // ─── 5. Filter timetable for selected student's class ────────────────
  const studentTimetable = useMemo(() => {
    if (!selectedStudentId) return [];
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return [];

    const studentClass = student.className.replace(/^Grade\s*/i, "");
    return timetable.filter((entry) => {
      const entryClass = (entry.classNO ?? "").replace(/^Grade\s*/i, "");
      return entryClass === studentClass;
    });
  }, [timetable, students, selectedStudentId]);

  // ─── 6. Selected student info ────────────────────────────────────────
  const selectedStudentInfo: AdmitCardStudentInfo | null = useMemo(() => {
    if (!selectedStudentId) return null;
    const s = students.find((st) => st.id === selectedStudentId);
    if (!s) return null;
    return {
      id: s.id,
      name: s.name,
      fatherName: s.fatherName,
      motherName: s.motherName,
      className: s.className,
      rollNo: s.rollNo,
      scholarNo: s.scholarNo,
    };
  }, [students, selectedStudentId]);

  // ─── 7. Bulk admit card data ─────────────────────────────────────────
  const bulkStudents = useMemo(() => {
    return Array.from(selectedIds).map((id) => {
      const s = students.find((st) => st.id === id);
      if (!s) return null;
      const studentClass = s.className.replace(/^Grade\s*/i, "");
      const studentTt = timetable.filter((entry) => {
        const entryClass = (entry.classNO ?? "").replace(/^Grade\s*/i, "");
        return entryClass === studentClass;
      });
      return {
        student: {
          id: s.id,
          name: s.name,
          fatherName: s.fatherName,
          motherName: s.motherName,
          className: s.className,
          rollNo: s.rollNo,
          scholarNo: s.scholarNo,
        },
        timetable: studentTt,
      };
    }).filter(Boolean) as { student: AdmitCardStudentInfo; timetable: ExamTimetableEntry[] }[];
  }, [selectedIds, students, timetable]);

  const toggleStudent = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const canGenerate = !!selectedExam && !!selectedClass && !!selectedStudentId;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#1a2b4c]" />
            Admit Card Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate exam admit cards with student photo and timetable.
          </p>
        </div>

        {/* ─── Filters ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Exam Select */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Select Exam
              </label>
              <Select
                value={selectedExam}
                onValueChange={(v) => {
                  setSelectedExam(v);
                  setSelectedStudentId(null);
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Choose an exam..." />
                </SelectTrigger>
                <SelectContent>
                  {examNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Class Select */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Select Class
              </label>
              <Select
                value={selectedClass}
                onValueChange={(v) => {
                  setSelectedClass(v);
                  setSelectedStudentId(null);
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Search Student */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Search Student
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, roll, scholar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white"
                  disabled={!selectedClass}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Main Content ─── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Student List ─── */}
          <div className="lg:w-96 shrink-0">
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                  <span>Students ({filteredStudents.length})</span>
                  <div className="flex items-center gap-2">
                    {studentsLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                    {selectedIds.size > 0 && (
                      <span className="text-xs bg-[#1a2b4c] text-white px-2 py-0.5 rounded-full">
                        {selectedIds.size} selected
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {!selectedClass ? (
                  <p className="text-sm text-slate-400 py-8 text-center">Select a class first</p>
                ) : studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">
                    {searchTerm ? "No students match your search" : "No students found"}
                  </p>
                ) : (
                  <div>
                    {/* Select All / Bulk Actions */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <Checkbox
                          checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={toggleAll}
                        />
                        Select All
                      </label>
                      {selectedIds.size > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => setShowBulk(true)}
                        >
                          <LayoutGrid className="h-3.5 w-3.5" />
                          Print {Math.min(selectedIds.size, 4)} Cards
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-100 overflow-y-auto pr-1">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                            selectedStudentId === student.id
                              ? "bg-[#1a2b4c] text-white"
                              : "hover:bg-slate-100 text-slate-700"
                          }`}
                          onClick={() => setSelectedStudentId(student.id)}
                        >
                          <Checkbox
                            checked={selectedIds.has(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={selectedStudentId === student.id ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-[#1a2b4c]" : ""}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold">{student.name}</span>
                            <span className="text-xs ml-2 opacity-70">
                              {student.rollNo ? `Roll: ${student.rollNo}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── Preview / Admit Card ─── */}
          <div className="flex-1 min-w-0">
            {showBulk && selectedIds.size > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-[#1a2b4c]" />
                    Bulk Admit Cards ({Math.min(selectedIds.size, 4)} of {selectedIds.size} on this page)
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setShowBulk(false)}
                  >
                    <User className="h-3.5 w-3.5 mr-1" /> Single View
                  </Button>
                </div>
                <AdmitCardBulkTemplate
                  students={bulkStudents}
                  examName={selectedExam}
                  sessionName={sessionName}
                />
              </div>
            ) : !canGenerate ? (
              <Card className="border-slate-200">
                <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-500 mb-1">No Admit Card Selected</h3>
                  <p className="text-sm text-slate-400 max-w-md">
                    Select an exam, a class, and choose a student from the list to generate their admit card.
                  </p>
                </CardContent>
              </Card>
            ) : timetableLoading ? (
              <Card className="border-slate-200">
                <CardContent className="py-16 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
                  <p className="text-sm text-slate-500">Loading exam timetable...</p>
                </CardContent>
              </Card>
            ) : selectedStudentInfo ? (
              <AdmitCard
                student={selectedStudentInfo}
                examName={selectedExam}
                sessionName={sessionName}
                timetable={studentTimetable}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

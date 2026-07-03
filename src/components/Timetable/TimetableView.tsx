import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import type { PeriodEntry } from "@/api/timetable";
import {
  fetchAllTimetables,
  fetchMyTimetable,
  deletePeriod,
} from "@/api/timetable";
import type { TeacherResponse } from "@/api/teacher";
import { fetchTeachers } from "@/api/teacher";
import { useAuth } from "@/hooks/AuthProvider";
import AssignPeriodModal from "./AssignPeriodModal";
import ClassTeacherAssign from "./ClassTeacherAssign";

const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

export default function TimetableView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "teacher-view"
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    searchParams.get("teacherId") || "__placeholder__"
  );
  const [selectedGrade, setSelectedGrade] = useState(
    searchParams.get("gradeClass") || "__placeholder__"
  );
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodEntry | null>(null);

  // ─── Sync state to URL params ────────────────────────────────────────
  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeTab && activeTab !== "teacher-view") params.tab = activeTab;
    if (selectedTeacherId && selectedTeacherId !== "__placeholder__") params.teacherId = selectedTeacherId;
    if (selectedGrade && selectedGrade !== "__placeholder__") params.gradeClass = selectedGrade;
    setSearchParams(params, { replace: true });
  }, [activeTab, selectedTeacherId, selectedGrade, setSearchParams]);

  // ─── Data ────────────────────────────────────────────────────────────
  const { data: allPeriods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ["timetable"],
    queryFn: fetchAllTimetables,
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  const { data: teacherTimetable = [], isLoading: teacherLoading } = useQuery({
    queryKey: ["my-timetable"],
    queryFn: fetchMyTimetable,
    enabled: isTeacher,
  });

  // ─── Filter periods by teacher ───────────────────────────────────────
  const teacherPeriods = useMemo(() => {
    if (!selectedTeacherId || selectedTeacherId === "__placeholder__") return [];
    return allPeriods.filter(
      (p: PeriodEntry) => p.teacher_id.toString() === selectedTeacherId
    );
  }, [allPeriods, selectedTeacherId]);

  // ─── Filter periods by grade ─────────────────────────────────────────
  const gradePeriods = useMemo(() => {
    if (!selectedGrade || selectedGrade === "__placeholder__") return [];
    return allPeriods.filter((p: PeriodEntry) => p.gradeClass === selectedGrade);
  }, [allPeriods, selectedGrade]);

  // ─── Delete mutation ─────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deletePeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({ queryKey: ["my-timetable"] });
      toast.success("Period deleted");
    },
    onError: () => toast.error("Failed to delete period"),
  });

  // ─── Get teacher name by ID ──────────────────────────────────────────
  const getTeacherName = (teacherId: number | string) => {
    const t = teachers.find(
      (t: TeacherResponse) => t.id.toString() === teacherId.toString()
    );
    return t?.fullName || t?.name || `Teacher #${teacherId}`;
  };

  // ─── Selected teacher object ─────────────────────────────────────────
  const selectedTeacher = useMemo(
    () =>
      teachers.find(
        (t: TeacherResponse) => t.id.toString() === selectedTeacherId
      ),
    [teachers, selectedTeacherId]
  );

  // ─── Render period list table ────────────────────────────────────────
  const renderPeriodTable = (
    periods: PeriodEntry[],
    showTeacher = true,
    showGrade = false,
    editable = false
  ) => {
    if (periods.length === 0) return null;

    const sorted = [...periods].sort(
      (a, b) => a.periodNumber - b.periodNumber
    );

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-bold text-slate-500 uppercase w-20">
                Period
              </TableHead>
              {showGrade && (
                <TableHead className="text-xs font-bold text-slate-500 uppercase">
                  Grade
                </TableHead>
              )}
              <TableHead className="text-xs font-bold text-slate-500 uppercase">
                Subject
              </TableHead>
              {showTeacher && (
                <TableHead className="text-xs font-bold text-slate-500 uppercase">
                  Teacher
                </TableHead>
              )}
              {editable && (
                <TableHead className="text-xs font-bold text-slate-500 uppercase w-24">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((period, idx) => (
              <TableRow key={period.id || idx} className="hover:bg-slate-50/50">
                <TableCell className="font-semibold text-slate-700">
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                    {period.periodNumber}
                  </Badge>
                </TableCell>
                {showGrade && (
                  <TableCell className="text-slate-700 font-medium">
                    {period.gradeClass}
                  </TableCell>
                )}
                <TableCell className="text-slate-700 font-medium">
                  {period.subjectName}
                </TableCell>
                {showTeacher && (
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {getTeacherName(period.teacher_id)}
                    </div>
                  </TableCell>
                )}
                {editable && (
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingPeriod(period);
                          setAssignModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-300"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (period.id) deleteMutation.mutate(period.id);
                        }}
                        className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300"
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
    );
  };

  // ─── Teacher's own view ──────────────────────────────────────────────
  const renderMyTimetable = () => {
    if (teacherLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
          <span className="ml-2 text-slate-500">Loading your timetable...</span>
        </div>
      );
    }

    if (teacherTimetable.length === 0) {
      return (
        <div className="text-center py-20 text-slate-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No timetable assigned yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Your classes will appear here once the admin assigns them.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-sm text-teal-800">
            <span className="font-semibold">My Timetable</span> — Showing all
            your assigned periods across grades for the current academic session.
          </p>
        </div>
        {renderPeriodTable(teacherTimetable, false, true, false)}
      </div>
    );
  };

  // ─── Grade-Wise View ─────────────────────────────────────────────────
  const renderGradeView = () => (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800 flex items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">Grade-Wise Timetable</span> —
            Select a grade to see which teacher teaches each period.
          </span>
        </p>
      </div>

      <div className="w-48">
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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

      {!selectedGrade || selectedGrade === "__placeholder__" ? (
        <div className="text-center py-20 text-slate-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">Select a grade</p>
          <p className="text-sm text-slate-400 mt-1">
            Choose a grade to view its timetable.
          </p>
        </div>
      ) : gradePeriods.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No timetable for {selectedGrade}</p>
          <p className="text-sm text-slate-400 mt-1">
            Go to the "Teacher Timetable" tab to assign periods.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 text-sm px-3 py-1"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              {selectedGrade}
            </Badge>
            <span className="text-xs text-slate-400 ml-auto">
              {gradePeriods.length} period{gradePeriods.length !== 1 ? "s" : ""} assigned
            </span>
          </div>
          {renderPeriodTable(gradePeriods, true, false, false)}
        </div>
      )}
    </div>
  );

  // ─── Teacher-Centric View ────────────────────────────────────────────
  const renderTeacherView = () => {
    const isLoading = periodsLoading || teachersLoading;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold">Teacher-Wise Timetable</span> —
              Select a teacher to view and manage their assigned periods for
              the academic session.
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-64">
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">
                    Select a teacher
                  </SelectItem>
                  {teachers.map((t: TeacherResponse) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.fullName}
                      {t.subject_specialization
                        ? ` (${t.subject_specialization})`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => {
                if (!selectedTeacherId) {
                  toast.error("Please select a teacher first");
                  return;
                }
                setEditingPeriod(null);
                setAssignModalOpen(true);
              }}
              disabled={!selectedTeacherId}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Period
            </Button>
          </div>
        </div>

        {!selectedTeacherId || selectedTeacherId === "__placeholder__" ? (
          <div className="text-center py-20 text-slate-500">
            <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">Select a teacher</p>
            <p className="text-sm text-slate-400 mt-1">
              Choose a teacher to view and manage their timetable.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-6 w-6" />
            <span className="ml-2 text-slate-500">Loading timetable...</span>
          </div>
        ) : teacherPeriods.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">
              No periods for {selectedTeacher?.fullName || selectedTeacher?.name}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Click "Add Period" to assign classes to this teacher.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-teal-50 text-teal-700 border-teal-200 text-sm px-3 py-1"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                {selectedTeacher?.fullName || selectedTeacher?.name}
              </Badge>
              {selectedTeacher?.subject_specialization && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {selectedTeacher.subject_specialization}
                </Badge>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {teacherPeriods.length} period
                {teacherPeriods.length !== 1 ? "s" : ""} assigned
              </span>
            </div>
            {renderPeriodTable(teacherPeriods, false, true, true)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Timetable Management
              </h1>
              <p className="text-sm text-slate-500">
                {isTeacher
                  ? "View your class schedule"
                  : "Manage teacher-wise timetables"}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-50">
              <TabsTrigger
                value="teacher-view"
                className="flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Teacher Timetable
              </TabsTrigger>
              <TabsTrigger
                value="grade-view"
                className="flex items-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" />
                Grade Timetable
              </TabsTrigger>
              {isTeacher && (
                <TabsTrigger
                  value="my-timetable"
                  className="flex items-center gap-1.5"
                >
                  <Calendar className="h-4 w-4" />
                  My Timetable
                </TabsTrigger>
              )}
              <TabsTrigger
                value="class-teacher"
                className="flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Class Teacher
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="teacher-view">
                {renderTeacherView()}
              </TabsContent>
              <TabsContent value="grade-view">
                {renderGradeView()}
              </TabsContent>
              <TabsContent value="my-timetable">
                {renderMyTimetable()}
              </TabsContent>
              <TabsContent value="class-teacher">
                <ClassTeacherAssign />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {assignModalOpen && (
        <AssignPeriodModal
          onClose={() => {
            setAssignModalOpen(false);
            setEditingPeriod(null);
          }}
          preselectedTeacherId={selectedTeacherId}
          existingPeriod={editingPeriod}
        />
      )}
    </div>
  );
}

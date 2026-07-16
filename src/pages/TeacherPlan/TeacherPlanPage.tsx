import { useState } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPlansByDateAndTeacher,
  saveTeacherPlan,
  deleteTeacherPlan,
  type TeacherPlanResponse,
} from "@/api/teacher-plan";
import {
  fetchTeachers,
  type TeacherResponse,
} from "@/api/teacher";
import DatePickerSimple from "@/components/DatePicker";

const CLASSES = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function TeacherPlanPage() {
  const queryClient = useQueryClient();
  const roleFromCookie = (getCookie("role") || "").replace(/^ROLE_/i, "");
  const isTeacher = roleFromCookie?.toLowerCase() === "teacher";

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterTeacherId, setFilterTeacherId] = useState<string>("");

  const loggedInTeacherId = parseInt(localStorage.getItem("teacherId") || "0");

  const [form, setForm] = useState({
    chapter: "",
    topic: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    classNo: "",
    period: 1,
    teacherId: "",
  });

  const update = (field: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }));

  // Fetch teachers (for admin dropdown)
  const { data: teachers = [] } = useQuery<TeacherResponse[]>({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  // Determine query params for fetching plans
  const queryDate = filterDate
    ? filterDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const queryTeacherId = isTeacher
    ? loggedInTeacherId
    : filterTeacherId
      ? parseInt(filterTeacherId)
      : 0;

  // Fetch plans by date and teacher
  const canFetch = isTeacher
    ? !!loggedInTeacherId
    : !!filterTeacherId;

  const {
    data: rawPlans,
    isLoading,
    isError,
  } = useQuery<TeacherPlanResponse[]>({
    queryKey: ["teacher-plans", queryDate, queryTeacherId],
    queryFn: () => fetchPlansByDateAndTeacher(queryDate, queryTeacherId),
    enabled: canFetch,
  });

  const plans = Array.isArray(rawPlans) ? rawPlans : [];

  // Save plan mutation
  const saveMutation = useMutation({
    mutationFn: saveTeacherPlan,
    onSuccess: () => {
      toast.success("Lesson plan added successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-plans"] });
      setForm({
        chapter: "",
        topic: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        classNo: "",
        period: 1,
        teacherId: "",
      });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to save lesson plan"),
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTeacherPlan,
    onSuccess: () => {
      toast.success("Lesson plan deleted");
      queryClient.invalidateQueries({ queryKey: ["teacher-plans"] });
    },
    onError: () => toast.error("Failed to delete lesson plan"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chapter.trim()) {
      toast.error("Chapter name is required");
      return;
    }
    if (!form.topic.trim()) {
      toast.error("Topic is required");
      return;
    }
    if (!form.classNo) {
      toast.error("Please select a class");
      return;
    }

    let teacherIdNum: number;
    if (isTeacher) {
      const tid = localStorage.getItem("teacherId");
      if (!tid) {
        toast.error("Teacher ID not found. Please login again.");
        return;
      }
      teacherIdNum = parseInt(tid);
    } else {
      if (!form.teacherId) {
        toast.error("Please select a teacher");
        return;
      }
      teacherIdNum = parseInt(form.teacherId);
    }

    saveMutation.mutate({
      chapter: form.chapter.trim(),
      topic: form.topic.trim(),
      description: form.description.trim(),
      date: form.date,
      classNo: form.classNo,
      teacherId: teacherIdNum,
      period: form.period,
    });
  };

  // Filter plans for teachers — only show their own plans
  const filteredPlans = isTeacher
    ? plans.filter((p) => p.teacherId === loggedInTeacherId)
    : plans;

  // Group plans by date, then by period
  const groupedByDate = filteredPlans.reduce<
    Record<string, TeacherPlanResponse[]>
  >((acc, plan) => {
    const dateKey = plan.date || "unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(plan);
    return acc;
  }, {});

  // Sort plans within each date by period number
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Lesson Plans
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isTeacher
                ? "Plan your daily lessons and topics for your class."
                : "View all teacher lesson plans."}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0d9488] hover:bg-teal-700 text-white shadow-sm"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson Plan
              </>
            )}
          </Button>
        </div>

        {/* Add Plan Form */}
        {showForm && (
          <Card className="border-slate-200 shadow-sm mb-8">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                New Lesson Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">
                      Chapter <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.chapter}
                      onChange={update("chapter")}
                      placeholder="e.g. Chapter 5: Algebra"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">
                      Topic <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.topic}
                      onChange={update("topic")}
                      placeholder="e.g. Linear Equations"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Date</Label>
                    <DatePickerSimple
                      DateTitle="Select date"
                      date={form.date ? new Date(form.date + "T00:00:00") : undefined}
                      setDate={(d: Date | undefined) =>
                        setForm((prev) => ({
                          ...prev,
                          date: d ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">
                      Class <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.classNo}
                      onValueChange={(v) =>
                        setForm((prev) => ({ ...prev, classNo: v }))
                      }
                    >
                      <SelectTrigger>
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
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Period</Label>
                    <Select
                      value={form.period.toString()}
                      onValueChange={(v) =>
                        setForm((prev) => ({ ...prev, period: parseInt(v) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map((p) => (
                          <SelectItem key={p} value={p.toString()}>
                            Period {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!isTeacher && (
                    <div>
                      <Label className="mb-1.5 block">
                        Teacher <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.teacherId}
                        onValueChange={(v) =>
                          setForm((prev) => ({ ...prev, teacherId: v }))
                        }
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
                  )}
                </div>
                <div>
                  <Label className="mb-1.5 block">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={update("description")}
                    placeholder="Describe the lesson plan, objectives, activities..."
                    rows={3}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="bg-[#0d9488] hover:bg-teal-700 text-white"
                  >
                    {saveMutation.isPending ? "Saving..." : "Save Lesson Plan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">Filter by Date</Label>
            <DatePickerSimple
              DateTitle="All dates"
              date={filterDate}
              setDate={setFilterDate}
            />
          </div>
          {!isTeacher && (
            <div>
              <Label className="mb-1.5 block text-xs text-slate-500">Select Teacher</Label>
              <Select
                value={filterTeacherId}
                onValueChange={setFilterTeacherId}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">
                    Select a teacher
                  </SelectItem>
                  {teachers.map((t: TeacherResponse) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.fullName}
                      {t.subject_specialization ? ` (${t.subject_specialization})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setFilterDate(new Date());
              if (isTeacher) setFilterTeacherId("");
            }}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          {filterDate && (
            <Button
              variant="ghost"
              onClick={() => setFilterDate(undefined)}
              className="text-slate-400"
            >
              <X className="h-4 w-4 mr-1" />
              Clear date
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8 text-slate-400" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-slate-500">
            Failed to load lesson plans. Please try again.
          </div>
        )}

        {/* Plans List */}
        {!isLoading && !isError && (
          <>
            {!canFetch && !isTeacher ? (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Select a teacher to view plans</p>
                <p className="text-sm text-slate-400 mt-1">
                  Use the filter above to choose a teacher and date.
                </p>
              </div>
            ) : sortedDates.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No lesson plans found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {isTeacher
                    ? 'Click "Add Lesson Plan" to create your first one.'
                    : "No plans for this teacher on the selected date."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => {
                  const dayPlans = [...groupedByDate[dateKey]].sort(
                    (a, b) => (a.period ?? 99) - (b.period ?? 99)
                  );
                  return (
                    <div key={dateKey}>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(dateKey).toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <div className="space-y-3">
                        {dayPlans.map((plan) => (
                          <Card
                            key={plan.id}
                            className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    {plan.period && (
                                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Period {plan.period}
                                      </Badge>
                                    )}
                                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 font-medium">
                                      {plan.classNo}
                                    </Badge>
                                    {plan.teacherName && (
                                      <span className="text-xs text-slate-400">
                                        by {plan.teacherName}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-slate-900 text-base">
                                    {plan.chapter}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-0.5">
                                    {plan.topic}
                                  </p>
                                  {plan.description && (
                                    <>
                                      <button
                                        onClick={() =>
                                          setExpandedId(
                                            expandedId === plan.id
                                              ? null
                                              : plan.id!
                                          )
                                        }
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 flex items-center gap-1"
                                      >
                                        {expandedId === plan.id ? (
                                          <>
                                            Less{" "}
                                            <ChevronUp className="h-3 w-3" />
                                          </>
                                        ) : (
                                          <>
                                            More{" "}
                                            <ChevronDown className="h-3 w-3" />
                                          </>
                                        )}
                                      </button>
                                      {expandedId === plan.id && (
                                        <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                          {plan.description}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (plan.id !== undefined) {
                                        deleteMutation.mutate(plan.id);
                                      }
                                    }}
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

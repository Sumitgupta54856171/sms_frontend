import React, { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Plus,
  Search,
  X,
  FileSpreadsheet,
  Calendar,
  GraduationCap,
  BookMarked,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import {
  fetchHomework,
  fetchHomeworkById,
  saveHomework,
  deleteHomework,
  type HomeworkItem,
  type HomeworkType,
  type QuestionType,
  type QuizQuestion,
} from "@/api/homework";
import { getSubjectsForClass, SUBJECT_GROUPS } from "@/api/subject";
import { downloadTemplateCsv, getTemplateColumns } from "@/lib/homework-templates";

const CLASS_OPTIONS = SUBJECT_GROUPS.flatMap((g) => g.classes);

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; icon: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice (Tick the correct)", icon: "✓" },
  { value: "fill_blank", label: "Fill in the Blank", icon: "___" },
  { value: "true_false", label: "True / False", icon: "T/F" },
  { value: "one_word", label: "One Word Answer", icon: "1W" },
  { value: "match_following", label: "Match the Following", icon: "↔" },
];

type ViewMode = "list" | "quiz" | "pdf";

const ALLOWED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const ext = name.slice(name.lastIndexOf("."));
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);
}

export default function HomeworkView() {
  const user = useAppSelector((s) => s.auth.user);
  const userRole = user?.role ?? "";
  const normalizedRole = userRole.replace(/^ROLE_/i, "").toLowerCase();
  const canUpload = ["teacher", "admin", "super_admin"].includes(normalizedRole);

  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "quiz" | "pdf">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedItem, setSelectedItem] = useState<HomeworkItem | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "quiz" as HomeworkType,
    classNo: "",
    subject: "",
    dueDate: "",
    questionType: "multiple_choice" as QuestionType,
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<{ name: string; code: string }[]>([]);

  useEffect(() => {
    loadHomework();
  }, []);

  useEffect(() => {
    if (form.classNo) {
      const subjects = getSubjectsForClass(form.classNo);
      setSubjectOptions(subjects);
      // Reset subject if current selection isn't in the new class
      if (!subjects.find((s) => s.name === form.subject)) {
        setForm((f) => ({ ...f, subject: "" }));
      }
    } else {
      setSubjectOptions([]);
    }
  }, [form.classNo]);

  const loadHomework = async () => {
    setLoading(true);
    try {
      const data = await fetchHomework();
      setItems(data);
    } catch {
      toast.error("Failed to load homework");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!isAllowedFile(selected)) {
      toast.error("Only CSV or Excel files are allowed");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.classNo.trim() || !form.subject.trim() || !form.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!file) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setSaving(true);
    try {
      await saveHomework({
        ...form,
        file,
        questionType: form.questionType,
      });
      toast.success("Homework added successfully");
      resetForm();
      setShowForm(false);
      loadHomework();
    } catch {
      toast.error("Failed to save homework");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "quiz",
      classNo: "",
      subject: "",
      dueDate: "",
      questionType: "multiple_choice",
    });
    setFile(null);
    setSubjectOptions([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this homework?")) return;
    try {
      await deleteHomework(id);
      toast.success("Homework deleted");
      loadHomework();
    } catch {
      toast.error("Failed to delete homework");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.classNo.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const [detailLoading, setDetailLoading] = useState(false);

  const openQuiz = async (item: HomeworkItem) => {
    const id = item.homeworkId ?? item.id;
    if (!id) return;
    setDetailLoading(true);
    try {
      const detail = await fetchHomeworkById(id);
      setSelectedItem(detail);
      setViewMode("quiz");
    } catch {
      toast.error("Failed to load quiz details");
    } finally {
      setDetailLoading(false);
    }
  };

  const openPdf = async (item: HomeworkItem) => {
    const id = item.homeworkId ?? item.id;
    if (!id) return;
    setDetailLoading(true);
    try {
      const detail = await fetchHomeworkById(id);
      setSelectedItem(detail);
      setViewMode("pdf");
    } catch {
      toast.error("Failed to load homework details");
    } finally {
      setDetailLoading(false);
    }
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedItem(null);
  };

  if (detailLoading) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm font-medium text-slate-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (viewMode === "quiz" && selectedItem?.questions) {
    return <QuizView item={selectedItem} onBack={backToList} />;
  }

  if (viewMode === "pdf" && selectedItem) {
    return <PdfView item={selectedItem} onBack={backToList} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-violet-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-3 border border-violet-100">
                <BookOpen className="h-3.5 w-3.5" />
                Homework Center
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Homework
              </h1>
              <p className="text-base text-slate-500 mt-2 leading-relaxed">
                Create quiz and PDF-based homework assignments. Upload questions via CSV or Excel.
              </p>
            </div>
            {canUpload && (
              <Button
                onClick={() => setShowForm(!showForm)}
                className={`shadow-md transition-all duration-200 ${
                  showForm
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-violet-600 hover:bg-violet-700 hover:shadow-lg hover:-translate-y-0.5 text-white"
                }`}
              >
                {showForm ? (
                  <><X className="h-4 w-4 mr-2" />Cancel</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />Add Homework</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Add Homework Form */}
        {canUpload && showForm && (
          <Card className="border-slate-200 shadow-lg mb-8 overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <BookMarked className="h-4 w-4 text-violet-600" />
                </div>
                Add New Homework
              </CardTitle>
              <CardDescription>
                Upload a CSV or Excel file. The backend will parse and store quiz questions or PDF content.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hw-title">Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="hw-title"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Maths Chapter 5 Quiz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-type">Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as HomeworkType }))}>
                      <SelectTrigger id="hw-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="pdf">PDF-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hw-description">Description</Label>
                  <textarea
                    id="hw-description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brief instructions for students..."
                    rows={3}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hw-class">Class <span className="text-red-500">*</span></Label>
                    <Select
                      value={form.classNo}
                      onValueChange={(v) => setForm((f) => ({ ...f, classNo: v }))}
                    >
                      <SelectTrigger id="hw-class">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-subject">Subject <span className="text-red-500">*</span></Label>
                    <Select
                      value={form.subject}
                      onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                      disabled={!form.classNo}
                    >
                      <SelectTrigger id="hw-subject">
                        <SelectValue placeholder={form.classNo ? "Select a subject" : "Select class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((sub) => (
                          <SelectItem key={sub.code} value={sub.name}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-due">Due Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="hw-due"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Question Type Selector — shown only for quiz type */}
                {form.type === "quiz" && (
                  <div className="space-y-2">
                    <Label>Question Type <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {QUESTION_TYPE_OPTIONS.map((qt) => (
                        <button
                          key={qt.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, questionType: qt.value }))}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            form.questionType === qt.value
                              ? "border-violet-500 bg-violet-50 text-violet-800 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg font-bold">{qt.icon}</span>
                          <span className="text-[11px] leading-tight text-center">{qt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hw-file">Upload File (CSV or Excel only) <span className="text-red-500">*</span></Label>
                    {form.type === "quiz" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplateCsv(form.questionType)}
                        className="border-violet-200 text-violet-700 hover:bg-violet-50 text-xs h-8"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                        Download {QUESTION_TYPE_OPTIONS.find((q) => q.value === form.questionType)?.label} Template
                      </Button>
                    )}
                  </div>

                  {/* Template column preview */}
                  {form.type === "quiz" && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                      <p className="text-[11px] font-medium text-slate-500 mb-2 uppercase tracking-wider">
                        Expected Columns — <span className="text-violet-600">{QUESTION_TYPE_OPTIONS.find((q) => q.value === form.questionType)?.label}</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {getTemplateColumns(form.questionType).map((col) => (
                          <span
                            key={col.header}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                              col.required
                                ? "bg-violet-50 text-violet-700 border border-violet-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {col.header}
                            {col.required && <span className="text-red-400">*</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Input
                      id="hw-file"
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                  </div>
                  {file && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      {file.name}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Add Homework
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search homework by title, subject or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-200 focus-visible:ring-violet-400 focus-visible:ring-offset-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-auto">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="all" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
                All
              </TabsTrigger>
              <TabsTrigger value="quiz" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
                Quiz
              </TabsTrigger>
              <TabsTrigger value="pdf" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
                PDF-based
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Loading homework...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No homework found</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {search ? "No homework matches your search." : "Get started by adding a new homework assignment."}
            </p>
          </div>
        )}

        {/* Homework Grid */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <Card
                key={item.homeworkId ?? item.id}
                className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl border ${
                        item.type === "quiz"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-amber-50 border-amber-200 text-amber-600"
                      }`}
                    >
                      {item.type === "quiz" ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${
                        item.type === "quiz"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {item.type === "quiz" ? "Quiz" : "PDF-based"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 mt-4 line-clamp-1">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {item.classNo}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                        <BookOpen className="h-3.5 w-3.5" />
                        {item.subject}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {item.dueDate}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {item.type === "quiz" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuiz(item)}
                          className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Quiz
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPdf(item)}
                          className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      )}
                      {canUpload && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.homeworkId ?? item.id!)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizView({ item, onBack }: { item: HomeworkItem; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [matchAnswers, setMatchAnswers] = useState<Record<number, Record<string, string>>>({});
  const [selectedLeft, setSelectedLeft] = useState<Record<number, string | null>>({});
  const matchContainerRef = useRef<HTMLDivElement>(null);

  const questions = item.questions ?? [];
  const questionType = item.questionType ?? "multiple_choice";

  const correctCount = questions.filter((q) => {
    if (q.questionType === "match_following") {
      const ma = matchAnswers[q.id] ?? {};
      const correctPairs = q.correctAnswer.split("|");
      const leftItems = q.options;
      let correct = 0;
      leftItems.forEach((left, i) => {
        if (ma[left] === correctPairs[i]) correct++;
      });
      return correct === leftItems.length;
    }
    return answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }).length;

  const totalQuestions = questions.length;

  const renderQuestion = (q: QuizQuestion, idx: number) => {
    const qt = q.questionType ?? questionType;

    return (
      <Card key={q.id} className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{q.question}</p>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">
                {qt === "multiple_choice" && "Tick the correct option"}
                {qt === "fill_blank" && "Fill in the blank"}
                {qt === "true_false" && "True or False"}
                {qt === "one_word" && "One word answer"}
                {qt === "match_following" && "Match the following"}
              </span>
            </div>
          </div>

          <div className="space-y-2 pl-9">
            {qt === "multiple_choice" &&
              q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                const showCorrect = submitted && option === q.correctAnswer;
                const showWrong = submitted && isSelected && option !== q.correctAnswer;
                return (
                  <button
                    key={option}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                      showCorrect
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : showWrong
                        ? "bg-red-50 border-red-300 text-red-800"
                        : isSelected
                        ? "bg-violet-50 border-violet-300 text-violet-800"
                        : "bg-white border-slate-200 text-slate-700 hover:border-violet-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}

            {qt === "true_false" &&
              ["TRUE", "FALSE"].map((option) => {
                const isSelected = answers[q.id] === option;
                const showCorrect = submitted && option === q.correctAnswer;
                const showWrong = submitted && isSelected && option !== q.correctAnswer;
                return (
                  <button
                    key={option}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      showCorrect
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : showWrong
                        ? "bg-red-50 border-red-300 text-red-800"
                        : isSelected
                        ? "bg-violet-50 border-violet-300 text-violet-800"
                        : "bg-white border-slate-200 text-slate-700 hover:border-violet-300"
                    }`}
                  >
                    {option === "TRUE" ? "✅ True" : "❌ False"}
                  </button>
                );
              })}

            {(qt === "fill_blank" || qt === "one_word") && (
              <div>
                <Input
                  placeholder={qt === "fill_blank" ? "Type your answer..." : "Type one word..."}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  disabled={submitted}
                  className={`border-slate-200 ${
                    submitted
                      ? answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                        ? "border-emerald-400 ring-1 ring-emerald-200"
                        : "border-red-400 ring-1 ring-red-200"
                      : ""
                  }`}
                />
                {submitted && (
                  <p className="text-xs mt-1.5 text-slate-500">
                    Correct answer: <span className="font-semibold text-emerald-600">{q.correctAnswer}</span>
                  </p>
                )}
              </div>
            )}

            {qt === "match_following" && (
              <div className="relative">
                {/* Two-column click-to-connect matching */}
                <div ref={matchContainerRef} className="flex justify-between gap-8 py-4">
                  {/* Left column */}
                  <div className="flex flex-col gap-4">
                    {q.options.map((leftItem, leftIdx) => {
                      const ma = matchAnswers[q.id] ?? {};
                      const isSelected = selectedLeft[q.id] === leftItem;
                      const isConnected = !!ma[leftItem];
                      const isCorrect = submitted && ma[leftItem] === q.correctAnswer.split("|")[leftIdx];
                      const isWrong = submitted && ma[leftItem] && ma[leftItem] !== q.correctAnswer.split("|")[leftIdx];
                      return (
                        <button
                          key={leftItem}
                          disabled={submitted || isConnected}
                          onClick={() => {
                            setSelectedLeft((prev) => ({
                              ...prev,
                              [q.id]: prev[q.id] === leftItem ? null : leftItem,
                            }));
                          }}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-w-44 ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                              : isWrong
                              ? "bg-red-50 border-red-400 text-red-800"
                              : isSelected
                              ? "bg-violet-50 border-violet-500 text-violet-800 shadow-md scale-105"
                              : isConnected
                              ? "bg-slate-100 border-slate-300 text-slate-500 cursor-default"
                              : "bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:shadow-sm"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold shrink-0">
                            {leftIdx + 1}
                          </span>
                          <span className="text-left">{leftItem}</span>
                          {isCorrect && <span className="ml-auto text-emerald-500"><CheckCircle2 className="h-4 w-4" /></span>}
                          {isWrong && <span className="ml-auto text-red-500"><X className="h-4 w-4" /></span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-4">
                    {q.options.map((rightItem, rightIdx) => {
                      const ma = matchAnswers[q.id] ?? {};
                      const isConnected = Object.values(ma).includes(rightItem);
                      const connectedLeft = Object.entries(ma).find(([, v]) => v === rightItem)?.[0];
                      const connectedLeftIdx = connectedLeft ? q.options.indexOf(connectedLeft) : -1;
                      const isCorrect = submitted && connectedLeft && ma[connectedLeft] === q.correctAnswer.split("|")[q.options.indexOf(connectedLeft)];
                      const isWrong = submitted && connectedLeft && !isCorrect;
                      const isHighlighted = selectedLeft[q.id] && !isConnected;
                      return (
                        <button
                          key={rightItem}
                          disabled={submitted || isConnected || !selectedLeft[q.id]}
                          onClick={() => {
                            const leftItem = selectedLeft[q.id];
                            if (!leftItem) return;
                            setMatchAnswers((prev) => ({
                              ...prev,
                              [q.id]: { ...prev[q.id], [leftItem]: rightItem },
                            }));
                            setSelectedLeft((prev) => ({ ...prev, [q.id]: null }));
                          }}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-w-44 ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                              : isWrong
                              ? "bg-red-50 border-red-400 text-red-800"
                              : isConnected
                              ? "bg-slate-100 border-slate-300 text-slate-500 cursor-default"
                              : isHighlighted
                              ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400 cursor-pointer animate-pulse"
                              : "bg-white border-slate-200 text-slate-700 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                            isConnected
                              ? "bg-violet-200 text-violet-800"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {isConnected ? connectedLeftIdx + 1 : String.fromCharCode(65 + rightIdx)}
                          </span>
                          <span className="text-left">{rightItem}</span>
                          {isCorrect && <span className="ml-auto text-emerald-500"><CheckCircle2 className="h-4 w-4" /></span>}
                          {isWrong && <span className="ml-auto text-red-500"><X className="h-4 w-4" /></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                {!submitted && (
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    {selectedLeft[q.id]
                      ? "Now click the matching item on the right side"
                      : "Click an item on the left, then click its match on the right"}
                  </p>
                )}

                {/* Correct matching summary after submit */}
                {submitted && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Correct Matching:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((left, i) => (
                        <div key={left} className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-medium text-slate-700">{left}</span>
                          <span className="text-slate-300">→</span>
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-200 text-violet-800 font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-emerald-600">{q.correctAnswer.split("|")[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const allAnswered = questions.every((q) => {
    if (q.questionType === "match_following") {
      const ma = matchAnswers[q.id] ?? {};
      return q.options.every((left) => ma[left] && ma[left].length > 0);
    }
    return answers[q.id] && answers[q.id].trim().length > 0;
  });

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={onBack} className="border-slate-200">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Quiz
          </Badge>
          {item.questionType && (
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
              {QUESTION_TYPE_OPTIONS.find((q) => q.value === item.questionType)?.label ?? item.questionType}
            </Badge>
          )}
        </div>

        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">Subject:</span> {item.subject} &nbsp;|&nbsp;
              <span className="font-medium text-slate-700">Class:</span> {item.classNo} &nbsp;|&nbsp;
              <span className="font-medium text-slate-700">Due:</span> {item.dueDate}
            </p>
            {item.description && <p className="text-sm text-slate-600 mt-2">{item.description}</p>}
          </CardContent>
        </Card>

        {questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No questions found in this quiz.</p>
            <p className="text-xs text-slate-400 mt-1">The CSV file may be empty or in an unexpected format.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">{questions.map((q, idx) => renderQuestion(q, idx))}</div>

            <div className="flex items-center justify-between mt-6">
              {!submitted ? (
                <Button
                  onClick={() => setSubmitted(true)}
                  disabled={!allAnswered}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-slate-900">
                    Score: {correctCount} / {totalQuestions}
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="border-slate-200">
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PdfView({ item, onBack }: { item: HomeworkItem; onBack: () => void }) {
  const contentRows: string[][] = Array.isArray(item.contentRows) ? item.contentRows : [];

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const bodyRows = contentRows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
    const headers = contentRows[0]?.map((h) => `<th>${h}</th>`).join("") ?? "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${item.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            h1 { font-size: 22px; margin-bottom: 6px; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f1f5f9; font-weight: 600; }
            .footer { margin-top: 18px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>${item.title}</h1>
          <div class="meta">
            Subject: ${item.subject} | Class: ${item.classNo} | Due: ${item.dueDate}
          </div>
          ${item.description ? `<p>${item.description}</p>` : ""}
          ${headers ? `<table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table>` : ""}
          <div class="footer">School Management System &bull; Homework Module</div>
          <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack} className="border-slate-200">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              PDF-based
            </Badge>
          </div>
          <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Subject: {item.subject} | Class: {item.classNo} | Due Date: {item.dueDate}
              </p>
            </div>

            {item.description && (
              <p className="text-sm text-slate-700 mb-6">{item.description}</p>
            )}

            {contentRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {contentRows[0].map((header, i) => (
                        <th key={i} className="border border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold text-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contentRows.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="border border-slate-200 px-4 py-2 text-slate-600">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No content rows available for this homework.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
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
  Download,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  saveHomework,
  deleteHomework,
  type HomeworkItem,
  type HomeworkType,
  type QuizQuestion,
} from "@/api/homework";

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

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  const row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = "";
      } else if (char === '\n' || char === '\r') {
        if (current !== "" || row.length > 0) {
          row.push(current.trim());
          rows.push([...row]);
          row.length = 0;
          current = "";
        }
      } else {
        current += char;
      }
    }
  }

  if (current !== "" || row.length > 0) {
    row.push(current.trim());
    rows.push([...row]);
  }

  return rows.filter((r) => r.some((c) => c !== ""));
}

async function parseExcel(file: File): Promise<string[][]> {
  try {
    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return (json as string[][]).filter((r) => r.some((c) => c !== undefined && c !== null && String(c).trim() !== ""));
  } catch {
    throw new Error("Excel parsing requires the 'xlsx' package. Please install it or use CSV format.");
  }
}

async function parseFile(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCSV(text);
  }
  return parseExcel(file);
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseQuizQuestions(rows: string[][]): QuizQuestion[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  const questionIdx = headers.findIndex((h) => h.includes("question"));
  const correctIdx = headers.findIndex((h) => h.includes("correct") || h.includes("answer"));
  const optionIndices = headers
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => h.includes("option") || h.includes("choice") || h.includes("opt"))
    .map(({ i }) => i)
    .slice(0, 4);

  const fallbackOptions = [1, 2, 3, 4].map((n) =>
    headers.findIndex((h) => h.includes(`option${n}`) || h.includes(`opt${n}`) || h.includes(`choice${n}`))
  );

  const finalOptionIndices =
    optionIndices.length >= 2 ? optionIndices : fallbackOptions.filter((i) => i !== -1);

  return rows.slice(1).map((row, idx) => {
    const question = row[questionIdx >= 0 ? questionIdx : 0] ?? "";
    const options = finalOptionIndices
      .map((i) => (i >= 0 ? row[i] : ""))
      .filter((o) => o !== "");
    const correctAnswer = correctIdx >= 0 ? row[correctIdx] : "";
    return {
      id: idx + 1,
      question,
      options,
      correctAnswer,
    };
  });
}

function parsePdfContent(rows: string[][]): string[][] {
  return rows;
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
  });
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHomework();
  }, []);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!isAllowedFile(selected)) {
      toast.error("Only CSV or Excel files are allowed");
      setFile(null);
      setParsedRows([]);
      setParsedQuestions([]);
      return;
    }

    setFile(selected);
    setParsing(true);
    try {
      const rows = await parseFile(selected);
      setParsedRows(rows);
      if (form.type === "quiz") {
        const questions = parseQuizQuestions(rows);
        setParsedQuestions(questions);
        toast.success(`Parsed ${questions.length} quiz questions`);
      } else {
        setParsedQuestions([]);
        toast.success(`Parsed ${rows.length - 1} content rows`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse file";
      toast.error(message);
      setFile(null);
      setParsedRows([]);
      setParsedQuestions([]);
    } finally {
      setParsing(false);
    }
  };

  const handleTypeChange = (type: HomeworkType) => {
    setForm((f) => ({ ...f, type }));
    if (parsedRows.length > 0) {
      if (type === "quiz") {
        setParsedQuestions(parseQuizQuestions(parsedRows));
      } else {
        setParsedQuestions([]);
      }
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.classNo.trim() || !form.subject.trim() || !form.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.type === "quiz" && parsedQuestions.length === 0) {
      toast.error("Please upload a valid quiz file");
      return;
    }

    setSaving(true);
    try {
      await saveHomework({
        ...form,
        file: file ?? undefined,
        questions: form.type === "quiz" ? parsedQuestions : undefined,
        contentRows: form.type === "pdf" ? parsedRows : undefined,
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
    });
    setFile(null);
    setParsedRows([]);
    setParsedQuestions([]);
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

  const openQuiz = (item: HomeworkItem) => {
    setSelectedItem(item);
    setViewMode("quiz");
  };

  const openPdf = (item: HomeworkItem) => {
    setSelectedItem(item);
    setViewMode("pdf");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedItem(null);
  };

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
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
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
                Upload a CSV or Excel file. For quizzes, include question, options, and correct answer columns.
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
                    <Select value={form.type} onValueChange={(v) => handleTypeChange(v as HomeworkType)}>
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
                    <Input
                      id="hw-class"
                      value={form.classNo}
                      onChange={(e) => setForm((f) => ({ ...f, classNo: e.target.value }))}
                      placeholder="e.g. Grade 5-A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-subject">Subject <span className="text-red-500">*</span></Label>
                    <Input
                      id="hw-subject"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. Mathematics"
                    />
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

                <div className="space-y-2">
                  <Label htmlFor="hw-file">Upload File (CSV or Excel only)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="hw-file"
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {parsing && <Loader2 className="h-5 w-5 animate-spin text-violet-600" />}
                  </div>
                  {file && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      {file.name}
                    </p>
                  )}
                </div>

                {form.type === "quiz" && parsedQuestions.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Preview: {parsedQuestions.length} questions parsed
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {parsedQuestions.slice(0, 3).map((q) => (
                        <div key={q.id} className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                          <p className="font-medium">{q.question}</p>
                          <p className="text-slate-400 mt-1">{q.options.join(" | ")}</p>
                        </div>
                      ))}
                      {parsedQuestions.length > 3 && (
                        <p className="text-xs text-slate-400">+ {parsedQuestions.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}

                {form.type === "pdf" && parsedRows.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Preview: {parsedRows.length - 1} content rows parsed
                    </p>
                  </div>
                )}

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
                    disabled={saving || parsing}
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
                key={item.id}
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
                          onClick={() => handleDelete(item.id)}
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

  const questions = item.questions ?? [];
  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;

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

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="font-medium text-slate-900 mb-4">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option) => {
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          {!submitted ? (
            <Button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length !== questions.length}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold text-slate-900">
                Score: {correctCount} / {questions.length}
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)} className="border-slate-200">
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PdfView({ item, onBack }: { item: HomeworkItem; onBack: () => void }) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = item.contentRows ?? [];
    const bodyRows = rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
    const headers = rows[0]?.map((h) => `<th>${h}</th>`).join("") ?? "";

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

  const rows = item.contentRows ?? [];

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

            {rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {rows[0].map((header, i) => (
                        <th key={i} className="border border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold text-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(1).map((row, i) => (
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

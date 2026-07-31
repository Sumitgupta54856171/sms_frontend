import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Printer,
  Search,
  Loader2,
  X,
  Award,
  Users,
  School,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { classes } from "@/components/data/class";
import { fetchStudentsByClass } from "@/api/student";
import { fetchTeacherClass } from "@/api/teacher";
import { getCookie } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import {
  fetchAssessmentNames,
  fetchProgressCards,
  getClassDisplayLabel,
  normalizeClassForApi,
  type AssessmentType,
  type StudentProgressCard,
} from "@/api/progress-card";

type SubjectMark = StudentProgressCard["subjects"][0];

function getExamTitle(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("annual")) return "Annual Examination";
  if (lower.includes("half")) return "Half Yearly Examination";
  if (lower.includes("quarter")) return "Quarterly Examination";
  if (lower.includes("monthly")) return "Monthly Test";
  return name;
}

function useSubjectData(cards: StudentProgressCard[]) {
  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    cards.forEach((card) => card.subjects.forEach((s) => subjectSet.add(s.subject)));
    return Array.from(subjectSet);
  }, [cards]);

  const subjectMap = useMemo(() => {
    const map = new Map<number, Map<string, SubjectMark>>();
    cards.forEach((card) => {
      const inner = new Map<string, SubjectMark>();
      card.subjects.forEach((s) => inner.set(s.subject, s));
      map.set(card.studentId, inner);
    });
    return map;
  }, [cards]);

  return { allSubjects, subjectMap };
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ProgressCardView() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedType, setSelectedType] = useState<AssessmentType | "">("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [cards, setCards] = useState<StudentProgressCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const currentSession = useAppSelector((s) => s.session.currentSession);
  const sessionLabel = currentSession?.sessionName ?? "—";

  const roleFromCookie = (getCookie("role") || "").replace(/^ROLE_/i, "");
  const isTeacher = roleFromCookie.toLowerCase() === "teacher";

  const { data: teacherClassName = "" } = useQuery({
    queryKey: ["teacher-class"],
    queryFn: fetchTeacherClass,
    enabled: isTeacher,
    staleTime: 5 * 60 * 1000,
  });

  const classOptions = useMemo(() => {
    let list = classes.map((c) => ({
      value: c.name,
      label: getClassDisplayLabel(c.name),
    }));
    if (isTeacher && teacherClassName) {
      list = list.filter(
        (c) =>
          c.value === teacherClassName ||
          c.value === teacherClassName.replace(/^Grade\s+/i, "") ||
          c.label === teacherClassName
      );
    }
    return list;
  }, [isTeacher, teacherClassName]);

  const apiClassNo = useMemo(
    () => (selectedClass ? normalizeClassForApi(selectedClass) : ""),
    [selectedClass]
  );

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", "class", apiClassNo],
    queryFn: () => fetchStudentsByClass(apiClassNo),
    enabled: !!apiClassNo,
  });

  const studentCount = studentsData?.studentdetail?.length ?? 0;
  console.log("Fetched students for class:", apiClassNo, studentsData);

  const { data: assessmentOptions = [] } = useQuery({
    queryKey: ["progress-card-assessments"],
    queryFn: fetchAssessmentNames,
    staleTime: 5 * 60 * 1000,
  });

  const filteredAssessments = useMemo(() => {
    if (!selectedType) return [];
    return assessmentOptions.filter((a) => a.type === selectedType);
  }, [assessmentOptions, selectedType]);

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedType("");
    setSelectedAssessment("");
    setCards([]);
    setSearch("");
  };

  const handleTypeChange = (value: AssessmentType) => {
    setSelectedType(value);
    setSelectedAssessment("");
    setCards([]);
  };

  const handleGenerate = async () => {
    if (!selectedClass || !selectedType || !selectedAssessment) {
      toast.error("Please select class, type, and assessment");
      return;
    }
    if (studentCount === 0) {
      toast.info("No students found for this class");
      return;
    }

    setLoading(true);
    setCards([]);
    try {
      const result = await fetchProgressCards(
        selectedClass,
        selectedAssessment,
        selectedType
      );
      setCards(result);
      if (result.length === 0) {
        toast.info("No marks found for this assessment");
      }
    } catch (err) {
      console.error("Progress card error:", err);
      toast.error("Failed to generate progress cards");
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;
    const q = search.toLowerCase();
    return cards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.rollNo.toLowerCase().includes(q) ||
        c.scholarNo.toLowerCase().includes(q)
    );
  }, [cards, search]);

  const { allSubjects, subjectMap } = useSubjectData(filteredCards);
  const displayClassName = getClassDisplayLabel(selectedClass);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    if (filteredCards.length === 0) return;

    const headers = [
      "#",
      "Scholar No.",
      "Roll No.",
      "Student Name",
      "Father's Name",
      "Mother's Name",
      ...allSubjects.map((sub) => `${sub} (Max)`),
      "Total",
      "Percentage",
      "Grade",
      "Result",
    ];

    const rows = filteredCards.map((card, idx) => {
      const inner = subjectMap.get(card.studentId);
      return [
        idx + 1,
        card.scholarNo,
        card.rollNo,
        card.name,
        card.fatherName,
        card.motherName,
        ...allSubjects.map((sub) => {
          const mark = inner?.get(sub);
          return mark ? `${mark.obtained}/${mark.maxMarks}` : "—";
        }),
        `${card.totalObtained}/${card.totalMax}`,
        card.percentage.toFixed(1),
        card.overallGrade,
        card.result,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeAssessment = selectedAssessment.replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `Progress_Card_${displayClassName}_${safeAssessment}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Excel file downloaded");
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans print:p-0 print:bg-white">
      <div className="mx-auto max-w-7xl print:max-w-none">
        <div className="print:hidden">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
                <Award className="h-3.5 w-3.5" />
                Progress Card
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Student Progress Card
              </h1>
              <p className="text-base text-slate-500 mt-2">
                Select a class, load students, then generate report cards from test or exam marks.
              </p>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm mb-6">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="space-y-2 w-full lg:w-56">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={handleClassChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full lg:w-44">
                  <Label>Type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => handleTypeChange(v as AssessmentType)}
                    disabled={!selectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Test / Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">Monthly Test</SelectItem>
                      <SelectItem value="exam">Examination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full lg:w-64">
                  <Label>Assessment</Label>
                  <Select
                    value={selectedAssessment}
                    onValueChange={(v) => {
                      setSelectedAssessment(v);
                      setCards([]);
                    }}
                    disabled={!selectedType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAssessments.map((a) => (
                        <SelectItem key={`${a.type}-${a.name}`} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !selectedClass || !selectedType || !selectedAssessment}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Generate Cards
                </Button>
              </div>

              {selectedClass && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4 text-indigo-500" />
                  {studentsLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading students...
                    </span>
                  ) : (
                    <span>
                      <strong>{studentCount}</strong> student{studentCount !== 1 ? "s" : ""} in{" "}
                      <strong>{displayClassName}</strong>
                      {studentsData?.classteacherName && (
                        <span className="text-slate-400">
                          {" "}
                          · Class teacher: {studentsData.classteacherName}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}

              {cards.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search student..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => window.print()} className="border-slate-200">
                    <Printer className="h-4 w-4 mr-2" /> Print All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    disabled={filteredCards.length === 0}
                    className="border-slate-200"
                  >
                    <Download className="h-4 w-4 mr-2" /> PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadExcel}
                    disabled={filteredCards.length === 0}
                    className="border-slate-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="print:hidden flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Generating progress cards...</p>
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div className="print:hidden text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No progress cards to show</p>
            <p className="text-sm text-slate-500 mt-1">
              Select a class to load students, then choose test/exam and generate cards.
            </p>
          </div>
        )}

        {!loading && filteredCards.length > 0 && (
          <div className="print:block">
            <ConsolidatedMarksheet
              cards={filteredCards}
              examTitle={getExamTitle(selectedAssessment)}
              className={displayClassName}
              sessionLabel={sessionLabel}
              allSubjects={allSubjects}
              subjectMap={subjectMap}
            />
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .marksheet-page { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function ConsolidatedMarksheet({
  cards,
  examTitle,
  className,
  sessionLabel,
  allSubjects,
  subjectMap,
}: {
  cards: StudentProgressCard[];
  examTitle: string;
  className: string;
  sessionLabel: string;
  allSubjects: string[];
  subjectMap: Map<number, Map<string, SubjectMark>>;
}) {
  return (
    <Card className="marksheet-page overflow-hidden border border-slate-300 bg-white shadow-lg print:shadow-none">
      <CardContent className="p-0">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white text-center py-5 px-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Rose Convent High School</h1>
          <p className="text-indigo-200 text-lg font-semibold mt-1">{examTitle}</p>
          <div className="flex justify-center gap-8 mt-1 text-sm text-indigo-200">
            <span>Class: <strong className="text-white">{className}</strong></span>
            <span>Session: <strong className="text-white">{sessionLabel}</strong></span>
          </div>
        </div>

        {/* ── Consolidated Marks Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold w-8">#</th>
                <th className="border border-slate-600 px-2 py-2 text-left font-semibold">Scholar No.</th>
                <th className="border border-slate-600 px-2 py-2 text-left font-semibold">Roll No.</th>
                <th className="border border-slate-600 px-2 py-2 text-left font-semibold min-w-[140px]">Student Name</th>
                <th className="border border-slate-600 px-2 py-2 text-left font-semibold min-w-[120px]">Father's Name</th>
                <th className="border border-slate-600 px-2 py-2 text-left font-semibold min-w-[120px]">Mother's Name</th>
                {allSubjects.map((sub) => (
                  <th key={sub} className="border border-slate-600 px-1 py-2 text-center font-semibold min-w-[70px]">{sub}<br /><span className="text-[9px] font-normal text-indigo-200">(Max)</span></th>
                ))}
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold w-14">Total</th>
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold w-14">%age</th>
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold w-12">Grade</th>
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold w-14">Result</th>
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold text-white bg-black">Class Teacher Sign</th>
                <th className="border border-slate-600 px-2 py-2 text-center font-semibold text-white bg-black">Parent Sign</th>
              </tr>
            </thead>
           
            <tbody>
               
              {cards.map((card, idx) => {
                const inner = subjectMap.get(card.studentId);
                return (
                  <tr
                    key={card.studentId}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"} hover:bg-indigo-50/50 transition-colors`}
                  >
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-500">{idx + 1}</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-mono text-slate-700">{card.scholarNo}</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-mono text-slate-700">{card.rollNo}</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-medium text-slate-900">{card.name}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{card.fatherName}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{card.motherName}</td>
                    {allSubjects.map((sub) => {
                      const mark = inner?.get(sub);
                      return (
                        <td key={sub} className="border border-slate-300 px-1 py-1.5 text-center font-semibold text-slate-900">
                          {mark ? `${mark.obtained}/${mark.maxMarks}` : "—"}
                        </td>
                      );
                    })}
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-900">{card.totalObtained}/{card.totalMax}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold text-slate-900">{card.percentage.toFixed(1)}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ["A1", "A2"].includes(card.overallGrade)
                          ? "bg-emerald-100 text-emerald-700"
                          : ["B1", "B2"].includes(card.overallGrade)
                            ? "bg-blue-100 text-blue-700"
                            : ["C1", "C2"].includes(card.overallGrade)
                              ? "bg-amber-100 text-amber-700"
                              : card.overallGrade === "D"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                      }`}>
                        {card.overallGrade}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        card.result === "Pass"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {card.result}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-400 italic">_______________</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-400 italic">_______________</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Summary & Signatures ── */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-300">
          <div className="text-sm text-slate-600">
            Total Students: <strong className="text-slate-900">{cards.length}</strong>
            {" | "}
            Passed: <strong className="text-emerald-700">{cards.filter((c) => c.result === "Pass").length}</strong>
            {" | "}
            Failed: <strong className="text-red-700">{cards.filter((c) => c.result === "Fail").length}</strong>
          </div>
          <div className="flex gap-16">
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2 w-36 mt-8">
                <p className="font-semibold text-slate-700 text-sm">Class Teacher</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2 w-36 mt-8">
                <p className="font-semibold text-slate-700 text-sm">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

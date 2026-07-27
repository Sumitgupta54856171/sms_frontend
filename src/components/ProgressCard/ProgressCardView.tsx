import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Printer,
  Search,
  Loader2,
  GraduationCap,
  Calendar,
  ChevronDown,
  Download,
  X,
  Award,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  fetchAssessmentNames,
  fetchProgressCards,
  type AssessmentOption,
  type StudentProgressCard,
} from "@/api/progress-card";

const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

function getAssessmentLabel(type: string): string {
  return type === "exam" ? "Examination" : "Monthly Test";
}

function getExamTitle(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("annual")) return "Annual Examination";
  if (lower.includes("half") || lower.includes("halfyearly") || lower.includes("half-yearly")) return "Half Yearly Examination";
  if (lower.includes("quarter") || lower.includes("quarterly")) return "Quarterly Examination";
  if (lower.includes("monthly")) return "Monthly Test";
  return name;
}

export default function ProgressCardView() {
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedType, setSelectedType] = useState<"test" | "exam" | "">("");
  const [selectedClass, setSelectedClass] = useState("");
  const [cards, setCards] = useState<StudentProgressCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await fetchAssessmentNames();
      setAssessments(data);
    } catch {
      toast.error("Failed to load assessments");
    }
  };

  const handleGenerate = async () => {
    if (!selectedAssessment || !selectedType || !selectedClass) {
      toast.error("Please select assessment and class");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchProgressCards(selectedAssessment, selectedType, selectedClass);
      setCards(data);
      if (data.length === 0) toast.info("No marks found for this assessment and class");
    } catch {
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

  const handlePrint = () => {
    window.print();
  };

  const selectedAssessmentObj = assessments.find((a) => a.name === selectedAssessment);

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans print:p-0 print:bg-white">
      <div className="mx-auto max-w-7xl print:max-w-none">
        {/* Controls - hidden in print */}
        <div className="print:hidden">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
                  <Award className="h-3.5 w-3.5" />
                  Progress Card
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Student Progress Card
                </h1>
                <p className="text-base text-slate-500 mt-2 leading-relaxed">
                  Generate premium landscape report cards for any test or examination.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="space-y-2 w-full lg:w-72">
                  <Label>Assessment</Label>
                  <Select
                    value={selectedAssessment}
                    onValueChange={(v) => {
                      const item = assessments.find((a) => a.name === v);
                      setSelectedAssessment(v);
                      setSelectedType(item?.type ?? "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test / exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments.map((a) => (
                        <SelectItem key={`${a.type}-${a.name}`} value={a.name}>
                          {a.name} ({getAssessmentLabel(a.type)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full lg:w-56">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate Cards
                </Button>

                {cards.length > 0 && (
                  <>
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
                    <Button variant="outline" onClick={handlePrint} className="border-slate-200">
                      <Printer className="h-4 w-4 mr-2" />
                      Print All
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {loading && (
          <div className="print:hidden flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Generating progress cards...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && cards.length === 0 && (
          <div className="print:hidden text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No progress cards to show</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Select an assessment and class, then click Generate Cards.
            </p>
          </div>
        )}

        {/* Progress Cards */}
        {!loading && filteredCards.length > 0 && (
          <div className="space-y-8 print:space-y-0">
            {filteredCards.map((card, index) => (
              <ProgressCard
                key={card.studentId}
                card={card}
                examTitle={getExamTitle(selectedAssessment)}
                assessmentType={selectedAssessmentObj?.type === "test" ? "Monthly Test" : "Examination"}
                isLast={index === filteredCards.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .progress-card-page {
            page-break-after: always;
            break-after: page;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin-bottom: 0 !important;
          }
          .progress-card-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}

function ProgressCard({
  card,
  examTitle,
  assessmentType,
  isLast,
}: {
  card: StudentProgressCard;
  examTitle: string;
  assessmentType: string;
  isLast: boolean;
}) {
  return (
    <Card
      className={`progress-card-page relative overflow-hidden border-2 border-slate-200 bg-white shadow-lg print:shadow-none ${isLast ? "" : ""}`}
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600" />

      <CardContent className="p-6 sm:p-8">
        {/* School Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 mb-3">
            <School className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">
            Rose Convent High School
          </h1>
          <p className="text-lg font-semibold text-indigo-700 mt-1">
            {examTitle}
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              Class: <strong>{card.className}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Session: 2024-2025
            </span>
          </div>
        </div>

        <Separator className="my-4 bg-slate-200" />

        {/* Student Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Student Name</p>
            <p className="font-semibold text-slate-900">{card.name}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Roll Number</p>
            <p className="font-semibold text-slate-900">{card.rollNo}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Scholar Number</p>
            <p className="font-semibold text-slate-900">{card.scholarNo}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Result</p>
            <Badge
              variant="outline"
              className={`mt-0.5 ${
                card.result === "Pass"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {card.result}
            </Badge>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Father's Name</p>
            <p className="font-semibold text-slate-900">{card.fatherName}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Mother's Name</p>
            <p className="font-semibold text-slate-900">{card.motherName}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Date of Birth</p>
            <p className="font-semibold text-slate-900">{card.dob || "—"}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Gender</p>
            <p className="font-semibold text-slate-900 capitalize">{card.gender || "—"}</p>
          </div>
        </div>

        {/* Marks Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700 w-1/2">
                  Subject
                </th>
                <th className="border border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-700">
                  Max Marks
                </th>
                <th className="border border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-700">
                  Obtained
                </th>
                <th className="border border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-700">
                  Grade
                </th>
                <th className="border border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-700">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {card.subjects.map((subject, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="border border-slate-200 px-4 py-2 font-medium text-slate-900">
                    {subject.subject}
                  </td>
                  <td className="border border-slate-200 px-4 py-2 text-center text-slate-600">
                    {subject.maxMarks}
                  </td>
                  <td className="border border-slate-200 px-4 py-2 text-center font-semibold text-slate-900">
                    {subject.obtained}
                  </td>
                  <td className="border border-slate-200 px-4 py-2 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ["A1", "A2"].includes(subject.grade)
                          ? "bg-emerald-100 text-emerald-700"
                          : ["B1", "B2"].includes(subject.grade)
                          ? "bg-blue-100 text-blue-700"
                          : ["C1", "C2"].includes(subject.grade)
                          ? "bg-amber-100 text-amber-700"
                          : subject.grade === "D"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {subject.grade}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-2 text-center text-slate-600">
                    {subject.remarks}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-indigo-50 font-bold">
                <td className="border border-slate-200 px-4 py-2.5 text-slate-900">Total</td>
                <td className="border border-slate-200 px-4 py-2.5 text-center text-slate-900">
                  {card.totalMax}
                </td>
                <td className="border border-slate-200 px-4 py-2.5 text-center text-slate-900">
                  {card.totalObtained}
                </td>
                <td className="border border-slate-200 px-4 py-2.5 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {card.overallGrade}
                  </span>
                </td>
                <td className="border border-slate-200 px-4 py-2.5 text-center text-slate-900">
                  {card.percentage.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Signatures */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-4">
            <p className="text-xs text-indigo-600 uppercase tracking-wide font-semibold">Percentage</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">{card.percentage.toFixed(2)}%</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4">
            <p className="text-xs text-emerald-600 uppercase tracking-wide font-semibold">Overall Grade</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{card.overallGrade}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-white border border-violet-100 p-4">
            <p className="text-xs text-violet-600 uppercase tracking-wide font-semibold">Result</p>
            <p className={`text-2xl font-bold mt-1 ${card.result === "Pass" ? "text-emerald-900" : "text-red-900"}`}>
              {card.result}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8 text-center text-sm text-slate-600">
          <div>
            <div className="border-t border-slate-300 pt-2 mt-16">
              <p className="font-semibold">Class Teacher</p>
            </div>
          </div>
          <div>
            <div className="border-t border-slate-300 pt-2 mt-16">
              <p className="font-semibold">Principal</p>
            </div>
          </div>
          <div>
            <div className="border-t border-slate-300 pt-2 mt-16">
              <p className="font-semibold">Parent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

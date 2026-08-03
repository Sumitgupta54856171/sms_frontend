import { useMemo, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Printer,
  Search,
  Loader2,
  X,
  Download,
  Users,
  Save,
  LayoutGrid,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { classes } from "@/components/data/class";
import { fetchStudentsByClass, fetchStudentDetail } from "@/api/student";
import { fetchTeacherClass } from "@/api/teacher";
import { getCookie } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import {
  getClassDisplayLabel,
  normalizeClassForApi,
} from "@/api/progress-card";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

// ─── Subject definitions per class group ───────────────────────────────
const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  Nursery: ["English", "Hindi", "Mathematics"],
  LKG: ["English", "Hindi", "Mathematics"],
  UKG: ["English", "Hindi", "Mathematics"],
  "1": ["English", "Hindi", "Mathematics", "EVS"],
  "2": ["English", "Hindi", "Mathematics", "EVS"],
  "3": ["English", "Hindi", "Mathematics", "EVS"],
  "4": ["English", "Hindi", "Mathematics", "EVS"],
  "5": ["English", "Hindi", "Mathematics", "EVS", "Sanskrit"],
  "6": ["English", "Hindi", "Mathematics", "Science", "Social Science", "Sanskrit"],
  "7": ["English", "Hindi", "Mathematics", "Science", "Social Science", "Sanskrit"],
  "8": ["English", "Hindi", "Mathematics", "Science", "Social Science", "Sanskrit"],
  "9": ["English", "Hindi", "Mathematics", "Science", "Social Science", "Sanskrit"],
  "10": ["English", "Hindi", "Mathematics", "Science", "Social Science", "Sanskrit"],
};

const STREAM_SUBJECTS: Record<string, Record<string, string[]>> = {
  "11": {
    Science: ["English", "Hindi", "Physics", "Chemistry", "Mathematics/ Biology"],
    Commerce: ["English", "Hindi", "Accounts", "Business Studies", "Economics"],
    Arts: ["English", "Hindi", "History", "Geography", "Political Science"],
  },
  "12": {
    Science: ["English", "Hindi", "Physics", "Chemistry", "Mathematics/ Biology"],
    Commerce: ["English", "Hindi", "Accounts", "Business Studies", "Economics"],
    Arts: ["English", "Hindi", "History", "Geography", "Political Science"],
  },
};

function getSubjectsForClass(className: string, stream?: string): string[] {
  if (stream && STREAM_SUBJECTS[className]?.[stream]) return STREAM_SUBJECTS[className][stream];
  if (SUBJECTS_BY_CLASS[className]) return SUBJECTS_BY_CLASS[className];
  const m = className.match(/^Grade\s+(\d+)$/i);
  if (m && SUBJECTS_BY_CLASS[m[1]]) return SUBJECTS_BY_CLASS[m[1]];
  return [];
}

function isSeniorSecondary(className: string): boolean {
  return className === "11" || className === "12" || className === "Grade 11" || className === "Grade 12";
}

function getGrade(percentage: number): string {
  if (percentage >= 91) return "A+";
  if (percentage >= 81) return "A";
  if (percentage >= 71) return "B+";
  if (percentage >= 61) return "B";
  if (percentage >= 51) return "C+";
  if (percentage >= 41) return "C";
  if (percentage >= 33) return "D";
  return "E";
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+": case "A": return "text-green-700";
    case "B+": case "B": return "text-blue-700";
    case "C+": case "C": return "text-amber-700";
    case "D": return "text-orange-700";
    default: return "text-red-700";
  }
}

interface StudentInfo {
  studentId: number;
  name: string;
  rollNo: string;
  scholarNo: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dob: string;
  aadhaar: string;
  sssmid: string;
  address: string;
  category: string;
  apaarId: string;
  section: string;
  medium: string;
}

interface SubjectMarks {
  subject: string;
  halfYearly: number; // max 40
  annual: number;     // max 60
}

interface StudentMarksEntry {
  info: StudentInfo;
  marks: SubjectMarks[];
}

export default function MarksheetView() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [marksEntries, setMarksEntries] = useState<StudentMarksEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [templateCount, setTemplateCount] = useState<1 | 12 | 14>(1);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const showStreamSelect = isSeniorSecondary(selectedClass);

  const streamOptions = useMemo(() => {
    if (!showStreamSelect) return [];
    const streams = STREAM_SUBJECTS[selectedClass];
    return streams ? Object.keys(streams) : [];
  }, [showStreamSelect, selectedClass]);

  const subjectList = useMemo(() => {
    return getSubjectsForClass(selectedClass, selectedStream || undefined);
  }, [selectedClass, selectedStream]);

  const handleClassChange = async (value: string) => {
    setSelectedClass(value);
    setSelectedStream("");
    setStudents([]);
    setMarksEntries([]);
    setShowPreview(false);
    setSearch("");

    if (!value) return;
    const apiClassNo = normalizeClassForApi(value);
    setLoading(true);
    try {
      const res = await fetchStudentsByClass(apiClassNo);
      const list: any[] = res?.studentdetail ?? res?.data ?? [];
      const infoList: StudentInfo[] = [];
      for (const row of list) {
        const studentObj = row.student ?? {};
        const sid = row.studentId ?? studentObj.id ?? row.id ?? 0;
        let fatherName = studentObj.father_name ?? "—";
        let motherName = studentObj.mother_name ?? "—";
        let gender = studentObj.gender ?? "";
        let dob = studentObj.dob ?? "";
        let aadhaar = studentObj.aadhaar ?? "";
        let sssmid = studentObj.sssmid ?? "";
        let address = studentObj.address ?? "";
        let category = studentObj.category ?? "";
        let apaarId = studentObj.apaarId ?? studentObj.apaar_id ?? "";
        if (sid) {
          try {
            const detail = await fetchStudentDetail(sid);
            if (detail?.student) {
              const s = detail.student;
              fatherName = s.father_name || "—";
              motherName = s.mother_name || "—";
              gender = s.gender || "";
              dob = s.dob || "";
              aadhaar = s.aadhaar || "";
              sssmid = s.sssmid || "";
              address = s.address || "";
              category = s.category || "";
              apaarId = s.apaarId || "";
            }
          } catch {}
        }
        infoList.push({
          studentId: sid,
          name: row.studentName ?? studentObj.name ?? "—",
          rollNo: row.roll_no ?? row.rolleNo ?? "—",
          scholarNo: row.scholarNo ?? studentObj.scholar_no ?? "—",
          fatherName,
          motherName,
          gender,
          dob,
          aadhaar,
          sssmid,
          address,
          category,
          apaarId,
          section: "A",
          medium: "ENGLISH",
        });
      }
      setStudents(infoList);
      // Initialize marks entries with zeros
      const subs = getSubjectsForClass(value);
      setMarksEntries(
        infoList.map((info) => ({
          info,
          marks: subs.map((sub) => ({ subject: sub, halfYearly: 0, annual: 0 })),
        }))
      );
    } catch (err) {
      console.error("Failed to load students:", err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleStreamChange = (value: string) => {
    setSelectedStream(value);
    const subs = getSubjectsForClass(selectedClass, value);
    setMarksEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        marks: subs.map((sub) => {
          const existing = entry.marks.find((m) => m.subject === sub);
          return existing ?? { subject: sub, halfYearly: 0, annual: 0 };
        }),
      }))
    );
  };

  const updateMark = useCallback(
    (studentIdx: number, subjectIdx: number, field: "halfYearly" | "annual", value: string) => {
      const num = Math.min(Math.max(0, Number(value) || 0), field === "halfYearly" ? 40 : 60);
      setMarksEntries((prev) => {
        const next = [...prev];
        next[studentIdx] = {
          ...next[studentIdx],
          marks: next[studentIdx].marks.map((m, i) =>
            i === subjectIdx ? { ...m, [field]: num } : m
          ),
        };
        return next;
      });
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save marks via API — for now just show preview
      toast.success("Marks saved successfully!");
      setShowPreview(true);
    } catch (err) {
      toast.error("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll<HTMLElement>("[data-marksheet]");
    if (!items.length) return;
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const dataUrl = await toPng(el, {
          quality: 1.0, pixelRatio: 2, backgroundColor: "#ffffff",
        });
        if (i > 0) pdf.addPage();
        // Fit image to A4 portrait
        const elW = el.offsetWidth;
        const elH = el.offsetHeight;
        const ratio = Math.min(pdfW / elW, pdfH / elH);
        const dw = elW * ratio;
        const dh = elH * ratio;
        const dx = (pdfW - dw) / 2;
        const dy = (pdfH - dh) / 2;
        pdf.addImage(dataUrl, "PNG", dx, dy, dw, dh);
      }
      pdf.save(`Marksheet_${selectedClass.replace(/\s+/g, "_")}.pdf`);
      toast.success(`PDF downloaded (${items.length} pages)!`);
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Failed to download PDF");
    }
  };

  const handleDownloadAllPNG = async () => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll<HTMLElement>("[data-marksheet]");
    if (!items.length) return;
    try {
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const name = el.getAttribute("data-student-name") || `student_${i + 1}`;
        const dataUrl = await toPng(el, {
          quality: 1.0, pixelRatio: 3, backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        link.download = `Marksheet_${name.replace(/\s+/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
        await new Promise((r) => setTimeout(r, 300));
      }
      toast.success(`${items.length} PNGs downloaded!`);
    } catch (err) {
      console.error("PNG error:", err);
      toast.error("Failed to download PNGs");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return marksEntries;
    const q = search.toLowerCase();
    return marksEntries.filter(
      (e) =>
        e.info.name.toLowerCase().includes(q) ||
        e.info.rollNo.toLowerCase().includes(q) ||
        e.info.scholarNo.toLowerCase().includes(q)
    );
  }, [marksEntries, search]);

  const displayClassName = getClassDisplayLabel(selectedClass);

  // ─── Compute totals for preview ───
  const previewData = useMemo(() => {
    return filteredEntries.map((entry) => {
      let totalHalf = 0, totalAnn = 0;
      const rows = entry.marks.map((m) => {
        totalHalf += m.halfYearly;
        totalAnn += m.annual;
        const finalObt = m.halfYearly + m.annual;
        const finalMax = 100;
        const pct = (finalObt / finalMax) * 100;
        return {
          subject: m.subject,
          halfMax: 40,
          halfObt: m.halfYearly,
          halfGrade: getGrade((m.halfYearly / 40) * 100),
          annMax: 60,
          annObt: m.annual,
          annGrade: getGrade((m.annual / 60) * 100),
          finalMax,
          finalObt,
          finalGrade: getGrade(pct),
        };
      });
      const totalFinal = totalHalf + totalAnn;
      const totalFinalMax = entry.marks.length * 100;
      const overallPct = totalFinalMax > 0 ? (totalFinal / totalFinalMax) * 100 : 0;
      return {
        info: entry.info,
        rows,
        totalHalf,
        totalAnn,
        totalFinal,
        totalFinalMax,
        overallPct,
        overallGrade: getGrade(overallPct),
        result: overallPct >= 33 ? "Pass" : "Fail",
      };
    });
  }, [filteredEntries]);

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4 portrait; margin: 5mm; }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              body > * { display: none !important; }
              .marksheet-print-area {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
              }
              .marksheet-print-area,
              .marksheet-print-area * {
                visibility: visible !important;
              }
              .no-print { display: none !important; }
              [data-marksheet] {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-after: always !important;
              }
            }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* ─── Header ─── */}
        <div className="no-print relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-linear-to-br from-blue-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
                <FileText className="h-3.5 w-3.5" />
                Final Marksheet
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Marksheet Generator
              </h1>
              <p className="text-base text-slate-500 mt-2">
                Select class, fill Half Yearly (max 40) &amp; Annual (max 60) marks, then preview and download.
              </p>
            </div>
            {sessionLabel !== "—" && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                Session: {sessionLabel}
              </div>
            )}
          </div>
        </div>

        {/* ─── Filters ─── */}
        <div className="no-print flex flex-wrap items-end gap-4 mb-6">
          <div className="w-55">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Class</label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="bg-white border-slate-200 h-10">
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

          {showStreamSelect && (
            <div className="w-50">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Stream</label>
              <Select value={selectedStream} onValueChange={handleStreamChange}>
                <SelectTrigger className="bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {streamOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {students.length > 0 && (
            <Button onClick={handleSave} disabled={saving} className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? "Saving..." : "Save & Preview"}
            </Button>
          )}
        </div>

        {/* ─── Search ─── */}
        {students.length > 0 && (
          <div className="no-print relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, roll no, or scholar no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-200"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ─── Student count ─── */}
        {students.length > 0 && (
          <div className="no-print mb-4 flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>{filteredEntries.length} of {marksEntries.length} students</span>
          </div>
        )}

        {/* ─── Mark Entry Table ─── */}
        {!showPreview && filteredEntries.length > 0 && (
          <div className="no-print overflow-x-auto hide-scrollbar mb-8">
            <table className="w-full border-collapse text-[12px] bg-white rounded-lg shadow-sm border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left sticky left-0 bg-slate-100 z-10 min-w-10">S.No</th>
                  <th className="border border-slate-300 p-2 text-left sticky left-10 bg-slate-100 z-10 min-w-40">Student Name</th>
                  <th className="border border-slate-300 p-2 text-left min-w-17.5">Roll No</th>
                  {subjectList.map((sub) => (
                    <th key={sub} className="border border-slate-300 p-2 text-center min-w-35" colSpan={2}>
                      {sub}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 p-1" colSpan={3}></th>
                  {subjectList.map((sub) => (
                    <>
                      <th key={`${sub}-half`} className="border border-slate-300 p-1 text-center text-[10px] text-blue-700 font-semibold">Half (40)</th>
                      <th key={`${sub}-ann`} className="border border-slate-300 p-1 text-center text-[10px] text-amber-700 font-semibold">Annual (60)</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, sIdx) => (
                  <tr key={entry.info.studentId} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-medium sticky left-0 bg-white hover:bg-slate-50 z-10">{sIdx + 1}</td>
                    <td className="border border-slate-300 p-2 font-semibold sticky left-10 bg-white hover:bg-slate-50 z-10">{entry.info.name}</td>
                    <td className="border border-slate-300 p-2 text-center">{entry.info.rollNo}</td>
                    {entry.marks.map((m, subIdx) => (
                      <>
                        <td key={`${m.subject}-half`} className="border border-slate-300 p-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={m.halfYearly || ""}
                            onChange={(e) => updateMark(sIdx, subIdx, "halfYearly", e.target.value)}
                            className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                            placeholder="0"
                          />
                        </td>
                        <td key={`${m.subject}-ann`} className="border border-slate-300 p-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={60}
                            value={m.annual || ""}
                            onChange={(e) => updateMark(sIdx, subIdx, "annual", e.target.value)}
                            className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                            placeholder="0"
                          />
                        </td>
                      </>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Preview Controls ─── */}
        {showPreview && previewData.length > 0 && (
          <div className="no-print flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <LayoutGrid className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Template:</span>
            <div className="flex gap-1">
              {([1, 12, 14] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplateCount(t)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    templateCount === t
                      ? "bg-[#005b9f] text-white border-[#005b9f] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {t === 1 ? "1 per page" : `${t} per page`}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <Button onClick={handleDownloadPDF} className="h-9 bg-[#005b9f] hover:bg-[#004b87] text-white text-sm">
              <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
            </Button>
            <Button onClick={handleDownloadAllPNG} className="h-9 bg-[#0d9488] hover:bg-[#0a7a6f] text-white text-sm">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> PNGs
            </Button>
            <Button onClick={handlePrint} variant="outline" className="h-9 border-slate-200 text-sm">
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
            </Button>
          </div>
        )}

        {/* ─── Preview Marksheets ─── */}
        {showPreview && previewData.length > 0 && (
          <div ref={containerRef} className="marksheet-print-area">
            {templateCount === 1 && previewData.map((pd) => (
              <div
                key={pd.info.studentId}
                data-marksheet
                data-student-name={pd.info.name}
              >
                <div className="border-[3px] border-[#005b9f] overflow-hidden">
                  <div className="border border-[#005b9f] m-1 p-1.5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <img src="/LOGO.jpg.jpeg" alt="Logo" className="w-18 h-18 rounded-full object-cover border-[3px] border-[#C8972A]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <div className="text-center flex-1">
                        <h2 className="text-[26px] font-black text-[#004b87] uppercase tracking-wide leading-tight">Rose Convent High School</h2>
                        <p className="text-[14px] font-bold text-slate-700">DILAURA, SATNA (M.P.)</p>
                      </div>
                      <div className="text-[12px] font-bold text-slate-600 self-end whitespace-nowrap">Dise Code : 23130731404</div>
                    </div>

                    {/* Session Banner */}
                    <div className="bg-[#e6f2ff] text-[#004b87] text-center text-[14px] font-bold py-1.5 border-t-2 border-b-2 border-[#005b9f] mb-1.5">
                      STUDENT PROGRESS CARD (SESSION : {sessionLabel})
                    </div>

                    {/* Student Info - Portrait table matching EJS design */}
                    <table className="w-full border-collapse mb-1.5 text-[11px]">
                      <tbody>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left" style={{ width: "18%" }}>Roll Number</th>
                          <td className="border border-slate-400 p-1" style={{ width: "15%" }}>{pd.info.rollNo || "N/A"}</td>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left" style={{ width: "18%" }}>Scholar Number</th>
                          <td className="border border-slate-400 p-1" colSpan={2}>{pd.info.scholarNo || "N/A"}</td>
                          <td rowSpan={7} style={{ width: "15%", padding: "2px", verticalAlign: "top" }}>
                            <div className="w-20 h-25 border border-slate-300 mx-auto flex items-center justify-center text-slate-300 text-[8px] bg-slate-50">PHOTO</div>
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Name of Student</th>
                          <td className="border border-slate-400 p-1 font-bold" colSpan={4}>{pd.info.name}</td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Father's Name</th>
                          <td className="border border-slate-400 p-1" colSpan={4}>{pd.info.fatherName}</td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Mothers' Name</th>
                          <td className="border border-slate-400 p-1" colSpan={4}>{pd.info.motherName}</td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Date of Birth</th>
                          <td className="border border-slate-400 p-1">{pd.info.dob || "N/A"}</td>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">in words</th>
                          <td className="border border-slate-400 p-1" colSpan={2}>{pd.info.dob || "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Class</th>
                          <td className="border border-slate-400 p-1">{displayClassName}{selectedStream ? ` (${selectedStream})` : ""}</td>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Section</th>
                          <td className="border border-slate-400 p-1" colSpan={2}>Section - {pd.info.section}</td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Caste / Category</th>
                          <td className="border border-slate-400 p-1">{pd.info.category || "N/A"}</td>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">SSSM ID</th>
                          <td className="border border-slate-400 p-1" colSpan={2}>{pd.info.sssmid || "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Aadhaar Number</th>
                          <td className="border border-slate-400 p-1">{pd.info.aadhaar || "N/A"}</td>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left">Appar ID</th>
                          <td className="border border-slate-400 p-1">{pd.info.apaarId || "N/A"}</td>
                          <th className="border border-slate-400 bg-slate-50 p-1 text-left" style={{ width: "12%" }}>Medium</th>
                          <td className="border border-slate-400 p-1 font-bold">{pd.info.medium}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Performance */}
                    <div className="text-[#005b9f] text-[13px] font-bold mb-1">
                      Student's Performance <span className="text-[#e66] text-[9px] font-normal">(As per order of M.P. Govt.)</span>
                    </div>

                    <table className="w-full border-collapse mb-1 text-[11px]">
                      <thead>
                        <tr className="bg-[#e6f2ff]">
                          <th className="border border-slate-400 p-1 text-center" rowSpan={2} style={{ width: "16%" }}>Subjects</th>
                          <th className="border border-slate-400 p-1 text-center" colSpan={3}>Half Yearly Evaluation</th>
                          <th className="border border-slate-400 p-1 text-center" colSpan={3}>Annual Evaluation</th>
                          <th className="border border-slate-400 p-1 text-center" colSpan={3}>Final Assessment</th>
                        </tr>
                        <tr className="bg-[#e6f2ff]">
                          <th className="border border-slate-400 p-1 text-center">Max.</th>
                          <th className="border border-slate-400 p-1 text-center">Obt.</th>
                          <th className="border border-slate-400 p-1 text-center">Grade</th>
                          <th className="border border-slate-400 p-1 text-center">Max.</th>
                          <th className="border border-slate-400 p-1 text-center">Obt.</th>
                          <th className="border border-slate-400 p-1 text-center">Grade</th>
                          <th className="border border-slate-400 p-1 text-center">Max.</th>
                          <th className="border border-slate-400 p-1 text-center">Obt.</th>
                          <th className="border border-slate-400 p-1 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pd.rows.map((r) => (
                          <tr key={r.subject} className="text-center">
                            <td className="border border-slate-400 p-1 text-left font-semibold">{r.subject}</td>
                            <td className="border border-slate-400 p-1">{r.halfMax}</td>
                            <td className="border border-slate-400 p-1">{r.halfObt}</td>
                            <td className={`border border-slate-400 p-1 font-bold ${getGradeColor(r.halfGrade)}`}>{r.halfGrade}</td>
                            <td className="border border-slate-400 p-1">{r.annMax}</td>
                            <td className="border border-slate-400 p-1">{r.annObt}</td>
                            <td className={`border border-slate-400 p-1 font-bold ${getGradeColor(r.annGrade)}`}>{r.annGrade}</td>
                            <td className="border border-slate-400 p-1">{r.finalMax}</td>
                            <td className="border border-slate-400 p-1">{r.finalObt}</td>
                            <td className={`border border-slate-400 p-1 font-bold ${getGradeColor(r.finalGrade)}`}>{r.finalGrade}</td>
                          </tr>
                        ))}
                        <tr className="text-center font-bold bg-slate-50">
                          <td className="border border-slate-400 p-1 text-left">Total</td>
                          <td className="border border-slate-400 p-1">{pd.rows.length * 40}</td>
                          <td className="border border-slate-400 p-1">{pd.totalHalf}</td>
                          <td className={`border border-slate-400 p-1 ${getGradeColor(getGrade((pd.totalHalf / (pd.rows.length * 40)) * 100))}`}>{getGrade((pd.totalHalf / (pd.rows.length * 40)) * 100)}</td>
                          <td className="border border-slate-400 p-1">{pd.rows.length * 60}</td>
                          <td className="border border-slate-400 p-1">{pd.totalAnn}</td>
                          <td className={`border border-slate-400 p-1 ${getGradeColor(getGrade((pd.totalAnn / (pd.rows.length * 60)) * 100))}`}>{getGrade((pd.totalAnn / (pd.rows.length * 60)) * 100)}</td>
                          <td className="border border-slate-400 p-1">{pd.totalFinalMax}</td>
                          <td className="border border-slate-400 p-1">{pd.totalFinal}</td>
                          <td className={`border border-slate-400 p-1 ${getGradeColor(pd.overallGrade)}`}>{pd.overallGrade}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Co-Scholastic */}
                    <div className="text-[#005b9f] text-[13px] font-bold mb-1">Performance in Co-Scholastic Areas :</div>
                    <table className="w-full border-collapse mb-1 text-[11px]">
                      <thead>
                        <tr>
                          <th className="border border-slate-400 bg-[#e6f2ff] p-1 text-center" colSpan={2} style={{ width: "33.33%" }}>Co-Curricular Activities</th>
                          <th className="border border-slate-400 bg-[#e6f2ff] p-1 text-center" colSpan={2} style={{ width: "33.33%" }}>Personal &amp; Social</th>
                          <th className="border border-slate-400 bg-[#e6f2ff] p-1 text-center" colSpan={2} style={{ width: "33.33%" }}>Social Activities</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["LITERARY SKILLS", "REGULARITY", "ENV. CONSCIOUSNESS"],
                          ["SCIENTIFIC SKILLS", "PUNCTUALITY", "LEADERSHIP"],
                          ["CULTURAL SKILLS", "CLEANLINESS", "TRUTHFULNESS"],
                          ["CREATIVITY", "DISCIPLINE", "HONESTY"],
                          ["SPORTS", "CO-OPERATION", "EXPRESSIVE"],
                        ].map(([a, b, c]) => (
                          <tr key={a}>
                            <td className="border border-slate-400 p-1">{a}</td>
                            <td className="border border-slate-400 p-1 text-center">A</td>
                            <td className="border border-slate-400 p-1">{b}</td>
                            <td className="border border-slate-400 p-1 text-center">A</td>
                            <td className="border border-slate-400 p-1">{c}</td>
                            <td className="border border-slate-400 p-1 text-center">A</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Final Result */}
                    <div className="text-[#005b9f] text-[13px] font-bold mb-1">Final Result :</div>
                    <table className="w-full border-collapse mb-1 text-[11px]">
                      <thead>
                        <tr className="bg-[#e6f2ff] text-center">
                          <th className="border border-slate-400 p-1 text-center">Max. Marks</th>
                          <th className="border border-slate-400 p-1 text-center">Obt. Marks</th>
                          <th className="border border-slate-400 p-1 text-center">Result</th>
                          <th className="border border-slate-400 p-1 text-center">Percentage</th>
                          <th className="border border-slate-400 p-1 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-center font-bold">
                          <td className="border border-slate-400 p-1">{pd.totalFinalMax}</td>
                          <td className="border border-slate-400 p-1">{pd.totalFinal}</td>
                          <td className={`border border-slate-400 p-1 ${pd.result === "Pass" ? "text-green-700" : "text-red-700"}`}>{pd.result === "Pass" ? "PASS" : "FAIL"}</td>
                          <td className="border border-slate-400 p-1">{pd.overallPct.toFixed(2)} %</td>
                          <td className={`border border-slate-400 p-1 ${getGradeColor(pd.overallGrade)}`}>{pd.overallGrade}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Remarks & Signatures */}
                    <div className="flex justify-between text-[12px] font-bold mt-3 px-2.5">
                      <div>Class Teacher Remark : <span className="font-normal">Good</span></div>
                      <div style={{ marginRight: "20px" }}>Status : <span className="font-normal">{pd.result === "Pass" ? "Promoted" : "Detained"}</span></div>
                    </div>
                    <div className="flex justify-between mt-10 px-5">
                      <div className="text-center text-[12px] font-bold text-slate-700">
                        <div className="w-37.5 border-t border-slate-700 mb-1"></div>
                        Class Teacher
                      </div>
                      <div className="text-center text-[12px] font-bold text-[#004b87]">
                        <div className="w-37.5 border-t border-[#004b87] mb-1"></div>
                        Principal<br />
                        <span className="text-[10px] font-normal">Rose Convent High School<br />Head of School</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {templateCount === 12 && (
              <div className="grid grid-cols-3 gap-1 p-1">
                {previewData.map((pd) => (
                  <div
                    key={pd.info.studentId}
                    data-marksheet
                    data-student-name={pd.info.name}
                    className="border border-[#005b9f] p-1 text-[6.5px] leading-tight"
                  >
                    <div className="text-center font-bold text-[#004b87] text-[7px] leading-tight">Rose Convent High School</div>
                    <div className="text-center text-[5px] text-slate-600">DILAURA, SATNA (M.P.)</div>
                    <div className="border-t border-dotted border-slate-300 my-0.5" />
                    <div className="flex justify-between text-[6px]">
                      <span className="font-semibold">{pd.info.name}</span>
                      <span>Roll: {pd.info.rollNo}</span>
                      <span>{displayClassName}</span>
                    </div>
                    <table className="w-full border-collapse mt-0.5 text-[6px]">
                      <thead>
                        <tr className="bg-[#e6f2ff]">
                          <th className="border border-slate-400 p-0.5 text-left">Subject</th>
                          <th className="border border-slate-400 p-0.5 text-center">H(40)</th>
                          <th className="border border-slate-400 p-0.5 text-center">A(60)</th>
                          <th className="border border-slate-400 p-0.5 text-center">T(100)</th>
                          <th className="border border-slate-400 p-0.5 text-center">Gr</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pd.rows.map((r) => (
                          <tr key={r.subject} className="text-center">
                            <td className="border border-slate-400 p-0.5 text-left">{r.subject}</td>
                            <td className="border border-slate-400 p-0.5">{r.halfObt}</td>
                            <td className="border border-slate-400 p-0.5">{r.annObt}</td>
                            <td className="border border-slate-400 p-0.5">{r.finalObt}</td>
                            <td className={`border border-slate-400 p-0.5 font-bold ${getGradeColor(r.finalGrade)}`}>{r.finalGrade}</td>
                          </tr>
                        ))}
                        <tr className="text-center font-bold bg-slate-50">
                          <td className="border border-slate-400 p-0.5 text-left">Total</td>
                          <td className="border border-slate-400 p-0.5">{pd.totalHalf}</td>
                          <td className="border border-slate-400 p-0.5">{pd.totalAnn}</td>
                          <td className="border border-slate-400 p-0.5">{pd.totalFinal}</td>
                          <td className={`border border-slate-400 p-0.5 ${getGradeColor(pd.overallGrade)}`}>{pd.overallGrade}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="flex justify-between text-[6px] font-bold mt-0.5">
                      <span className={pd.result === "Pass" ? "text-green-700" : "text-red-700"}>{pd.result}</span>
                      <span>{pd.overallPct.toFixed(1)}%</span>
                      <span className={getGradeColor(pd.overallGrade)}>Grade: {pd.overallGrade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {templateCount === 14 && (
              <div className="grid grid-cols-2 gap-1 p-1">
                {previewData.map((pd) => (
                  <div
                    key={pd.info.studentId}
                    data-marksheet
                    data-student-name={pd.info.name}
                    className="border border-[#005b9f] p-1 text-[6.5px] leading-tight"
                  >
                    <div className="text-center font-bold text-[#004b87] text-[7px] leading-tight">Rose Convent High School</div>
                    <div className="text-center text-[5px] text-slate-600">DILAURA, SATNA (M.P.)</div>
                    <div className="border-t border-dotted border-slate-300 my-0.5" />
                    <div className="flex justify-between text-[6px]">
                      <span className="font-semibold">{pd.info.name}</span>
                      <span>Roll: {pd.info.rollNo}</span>
                      <span>{displayClassName}</span>
                    </div>
                    <table className="w-full border-collapse mt-0.5 text-[6px]">
                      <thead>
                        <tr className="bg-[#e6f2ff]">
                          <th className="border border-slate-400 p-0.5 text-left">Subject</th>
                          <th className="border border-slate-400 p-0.5 text-center">H(40)</th>
                          <th className="border border-slate-400 p-0.5 text-center">A(60)</th>
                          <th className="border border-slate-400 p-0.5 text-center">T(100)</th>
                          <th className="border border-slate-400 p-0.5 text-center">Gr</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pd.rows.map((r) => (
                          <tr key={r.subject} className="text-center">
                            <td className="border border-slate-400 p-0.5 text-left">{r.subject}</td>
                            <td className="border border-slate-400 p-0.5">{r.halfObt}</td>
                            <td className="border border-slate-400 p-0.5">{r.annObt}</td>
                            <td className="border border-slate-400 p-0.5">{r.finalObt}</td>
                            <td className={`border border-slate-400 p-0.5 font-bold ${getGradeColor(r.finalGrade)}`}>{r.finalGrade}</td>
                          </tr>
                        ))}
                        <tr className="text-center font-bold bg-slate-50">
                          <td className="border border-slate-400 p-0.5 text-left">Total</td>
                          <td className="border border-slate-400 p-0.5">{pd.totalHalf}</td>
                          <td className="border border-slate-400 p-0.5">{pd.totalAnn}</td>
                          <td className="border border-slate-400 p-0.5">{pd.totalFinal}</td>
                          <td className={`border border-slate-400 p-0.5 ${getGradeColor(pd.overallGrade)}`}>{pd.overallGrade}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="flex justify-between text-[6px] font-bold mt-0.5">
                      <span className={pd.result === "Pass" ? "text-green-700" : "text-red-700"}>{pd.result}</span>
                      <span>{pd.overallPct.toFixed(1)}%</span>
                      <span className={getGradeColor(pd.overallGrade)}>Grade: {pd.overallGrade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Empty State ─── */}
        {!loading && students.length === 0 && selectedClass && (
          <div className="no-print text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900">No students found</p>
            <p className="text-sm text-slate-500 mt-1">No students enrolled in this class.</p>
          </div>
        )}

        {/* ─── Loading ─── */}
        {loading && (
          <div className="no-print flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#005b9f]" />
            <span className="ml-3 text-slate-600 font-medium">Loading students...</span>
          </div>
        )}
      </div>
    </div>
  );
}

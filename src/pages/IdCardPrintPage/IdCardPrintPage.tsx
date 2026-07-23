import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Circle, CheckCircle, AlertCircle } from "lucide-react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchStudentsByClass } from "@/api/student";
import IdCard85x55 from "@/components/IdCard85x55";

const ALL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

const MAX_SELECTION = 10;

export default function IdCardPrintPage() {
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Strip "Grade " prefix — API expects just the number
  const classNumber = selectedClass.replace(/^Grade\s*/i, "");

  const { data, isLoading } = useQuery({
    queryKey: ["students-by-class-print", classNumber],
    queryFn: () => fetchStudentsByClass(classNumber),
  });

  const students = useMemo(() => {
    if (!data) return [];
    const raw = data?.studentdetail ?? data?.data ?? data ?? [];
    return raw.map((item: any, idx: number) => {
      const s = item.student ?? item;
      return {
        id: s.id ?? item.studentId ?? idx + 1,
        name: s.name ?? s.StudentName ?? "",
        father_name: s.father_name ?? s.faterhName ?? "",
        scholar_no: s.scholar_no ?? s.scholarNo ?? "",
        classInfo: item.class_no ?? classNumber,
      };
    });
  }, [data, classNumber]);

  // Auto-select first 10 students when data loads
  const initialAutoSelectDone = useRef(false);
  useMemo(() => {
    if (students.length > 0 && !initialAutoSelectDone.current) {
      const initial = new Set<number>();
      for (let i = 0; i < Math.min(students.length, MAX_SELECTION); i++) {
        initial.add(students[i].id);
      }
      setSelectedIds(initial);
      initialAutoSelectDone.current = true;
    }
  }, [students]);

  // Selected students array
  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedIds.has(s.id));
  }, [students, selectedIds]);

  const toggleStudent = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_SELECTION) return prev;
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!printRef.current || selectedStudents.length === 0) return;
    setDownloading(true);

    try {
      const pageEl = printRef.current.querySelector(".id-card-a4-page") as HTMLElement | undefined;
      if (!pageEl) return;

      const dataUrl = await toPng(pageEl, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `ID_Cards_${selectedClass.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download:", err);
    } finally {
      setDownloading(false);
    }
  }, [selectedStudents, selectedClass]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              ID Card Generator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select up to <strong>10 students</strong> — cards arranged on A4 landscape page (85mm × 54mm each).
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); initialAutoSelectDone.current = false; setSelectedIds(new Set()); }}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-500 font-medium">Class</p>
              <p className="text-lg font-bold text-slate-900">{selectedClass}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-500 font-medium">Total Students</p>
              <p className="text-lg font-bold text-slate-900">{students.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-500 font-medium">Selected</p>
              <p className="text-lg font-bold text-[#0d9488]">{selectedStudents.length} / {MAX_SELECTION}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-500 font-medium">Layout</p>
              <p className="text-lg font-bold text-slate-900">A4 Landscape</p>
            </CardContent>
          </Card>
        </div>

        {/* ─── Student List + Preview ─── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Student List (Radio Selection) ─── */}
          <div className="lg:w-96 shrink-0">
            <Card className="border-slate-200">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-700">
                    Students ({students.length})
                  </h2>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedIds.size >= MAX_SELECTION && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-xs mb-2 bg-amber-50 px-2 py-1 rounded">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Maximum {MAX_SELECTION} students selected
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : students.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No students found.</p>
                ) : (
                  <div className="space-y-0.5 max-h-96 overflow-y-auto pr-1">
                    {students.map((s, idx) => {
                      const isSelected = selectedIds.has(s.id);
                      const isDisabled = !isSelected && selectedIds.size >= MAX_SELECTION;
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                            isSelected
                              ? "bg-indigo-50 text-indigo-900"
                              : "hover:bg-slate-50 text-slate-700"
                          } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudent(s.id)}
                            disabled={isDisabled}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-slate-400 font-mono w-6 shrink-0">{idx + 1}.</span>
                          <span className="font-medium truncate">{s.name}</span>
                          <span className="text-xs text-slate-400 ml-auto shrink-0">#{s.scholar_no || "—"}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── Preview Area ─── */}
          <div className="flex-1 min-w-0">
            {selectedStudents.length === 0 ? (
              <div className="flex items-center justify-center h-100 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="text-center text-slate-400">
                  <Circle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">Select students from the list</p>
                  <p className="text-xs mt-1">Choose up to {MAX_SELECTION} to generate ID cards</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">
                    Preview — {selectedStudents.length} Card{selectedStudents.length > 1 ? "s" : ""}
                  </h2>
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="gap-2 bg-[#0d9488] hover:bg-[#0a7a6f]"
                    size="sm"
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {downloading ? "Downloading..." : "Download PNG"}
                  </Button>
                </div>

                {/* A4 Landscape Page */}
                <div ref={printRef} className="id-card-print-area">
                  <div
                    className="id-card-a4-page"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 54mm)",
                      gridTemplateRows: "repeat(2, 85mm)",
                      gap: "3mm 4mm",
                      padding: "8mm 6mm",
                      justifyContent: "center",
                      alignContent: "center",
                      width: "297mm",
                      height: "210mm",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff",
                      borderRadius: "4px",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {selectedStudents.map((s) => (
                      <IdCard85x55 key={s.id} student={s} />
                    ))}
                    {/* Fill empty slots */}
                    {Array.from({ length: MAX_SELECTION - selectedStudents.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ visibility: "hidden" }} />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  A4 Landscape · 5 columns × 2 rows · Card size: 54mm × 85mm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

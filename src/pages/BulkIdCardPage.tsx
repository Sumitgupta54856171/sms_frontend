import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Download } from "lucide-react";
import { toPng } from 'html-to-image';

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
import IdCardMini from "@/components/IdCardMini";

const ALL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

export default function BulkIdCardPage() {
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const printRef = useRef<HTMLDivElement>(null);

  // Strip "Grade " prefix — API expects just the number
  const classNumber = selectedClass.replace(/^Grade\s*/i, "");

  const { data, isLoading } = useQuery({
    queryKey: ["students-by-class-bulk", classNumber],
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
        roll: item.roll_no ?? "",
      };
    });
  }, [data, classNumber]);

  // Split into pages of 10
  const pages = useMemo(() => {
    const result: typeof students[] = [];
    for (let i = 0; i < students.length; i += 10) {
      result.push(students.slice(i, i + 10));
    }
    return result;
  }, [students]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAll = async () => {
    if (!printRef.current || students.length === 0) return;
    
    const cards = printRef.current.querySelectorAll('.id-card-mini');
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const student = students[i];
      
      if (!student) continue;
      
      try {
        const dataUrl = await toPng(card, {
          quality: 1.0,
          pixelRatio: 8, // Ultra high quality (8x resolution for 600+ DPI print)
          backgroundColor: '#ffffff',
        });
        
        const link = document.createElement('a');
        link.download = `ID_Card_${student.name.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Failed to download card for ${student.name}:`, err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .bulk-id-print-area, .bulk-id-print-area * { visibility: visible; }
          .bulk-id-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 5mm 6mm;
            background: white;
          }
          .bulk-id-print-area .id-card-page {
            page-break-after: always;
            display: grid !important;
            grid-template-columns: repeat(5, 54mm);
            grid-template-rows: repeat(2, 85mm);
            gap: 4mm 3mm;
            padding: 0;
            justify-content: center;
          }
          .bulk-id-print-area .id-card-page:last-child {
            page-break-after: avoid;
          }
          .bulk-id-print-area .id-card-mini {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}} />

      {/* Controls - hidden when printing */}
      <div className="no-print mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Bulk ID Card Print
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select a class to print ID cards (10 per A4 page).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} className="gap-2 bg-[#1a2b4c] hover:bg-[#121c33]">
              <Printer className="h-4 w-4" />
              Print All ({students.length} cards)
            </Button>
            <Button onClick={handleDownloadAll} className="gap-2 bg-[#0d9488] hover:bg-[#0a7a6f]">
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium">Class</p>
              <p className="text-xl font-bold text-slate-900">{selectedClass}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium">Total Students</p>
              <p className="text-xl font-bold text-slate-900">{students.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium">Pages (A4)</p>
              <p className="text-xl font-bold text-slate-900">{pages.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Area */}
      <div ref={printRef} className="bulk-id-print-area mx-auto max-w-6xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 no-print">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-slate-400 no-print">
            <p className="text-sm font-medium">No students found in {selectedClass}.</p>
          </div>
        ) : (
          pages.map((pageStudents, pageIdx) => (
            <div
              key={pageIdx}
              className="id-card-page"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 54mm)",
                gridTemplateRows: "repeat(2, 85mm)",
                gap: "4mm 3mm",
                justifyContent: "center",
                padding: "8mm 6mm",
                pageBreakAfter: pageIdx < pages.length - 1 ? "always" : "avoid",
              }}
            >
              {pageStudents.map((s: any) => (
                <IdCardMini key={s.id} student={s} />
              ))}
              {/* Fill empty slots if less than 10 on last page */}
              {pageIdx === pages.length - 1 &&
                Array.from({ length: 10 - pageStudents.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="invisible" />
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

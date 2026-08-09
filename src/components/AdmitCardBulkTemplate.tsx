import { useState, useRef } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import AdmitCard from "./AdmitCard";
import type { AdmitCardStudentInfo } from "./AdmitCard";
import type { ExamTimetableEntry } from "@/api/admit-card";

interface BulkCardData {
  student: AdmitCardStudentInfo;
  timetable: ExamTimetableEntry[];
}

interface AdmitCardBulkTemplateProps {
  students: BulkCardData[];
  examName: string;
  sessionName: string;
}

export default function AdmitCardBulkTemplate({
  students,
  examName,
  sessionName,
}: AdmitCardBulkTemplateProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"png" | "pdf" | null>(null);

  const handlePrint = () => window.print();

  const handleDownloadPNG = async () => {
    if (!templateRef.current) return;
    setDownloading("png");
    try {
      const dataUrl = await toPng(templateRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const link = document.createElement("a");
      link.download = "Admit_Cards_Bulk.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download PNG:", err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!templateRef.current) return;
    setDownloading("pdf");
    try {
      const dataUrl = await toPng(templateRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 190;
      const imgWidth = templateRef.current.offsetWidth;
      const imgHeight = templateRef.current.offsetHeight;
      const pageHeight = (pageWidth * imgHeight) / imgWidth;
      pdf.addImage(dataUrl, "PNG", 10, 10, pageWidth, pageHeight);
      pdf.save("Admit_Cards_Bulk.pdf");
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setDownloading(null);
    }
  };

  const visibleStudents = students.slice(0, 4);

  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 print-hidden" id="bulk-admit-actions">
        <Button onClick={handlePrint} className="gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white shadow-md">
          <Printer className="h-4 w-4" /> Print All ({visibleStudents.length})
        </Button>
        <Button
          onClick={handleDownloadPNG}
          disabled={downloading === "png"}
          className="gap-2 bg-[#0d9488] hover:bg-[#0a7a6f] text-white shadow-md"
        >
          {downloading === "png" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}{" "}
          Download PNG
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading === "pdf"}
          className="gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-md"
        >
          {downloading === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}{" "}
          Download PDF
        </Button>
      </div>

      {/* A4 Bulk Template - 2×2 Grid */}
      <div
        ref={templateRef}
        id="bulk-admit-template"
        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-200 p-[6mm] print:p-0 print:shadow-none print:border-none"
      >
        <div className="grid grid-cols-2 gap-[5mm] h-full">
          {Array.from({ length: 4 }).map((_, idx) => {
            const card = visibleStudents[idx];
            if (!card) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[8px]"
                >
                  Empty Slot
                </div>
              );
            }
            return (
              <div key={card.student.id} className="flex">
                <AdmitCard
                  student={card.student}
                  examName={examName}
                  sessionName={sessionName}
                  timetable={card.timetable}
                  compact
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body, html { margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #bulk-admit-template, #bulk-admit-template * { visibility: visible; }
          #bulk-admit-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #bulk-admit-actions { display: none !important; }
          .print-hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}

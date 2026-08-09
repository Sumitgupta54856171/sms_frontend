import { useState, useEffect, useRef } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { fetchStudentPhoto, getPhotoBlobUrl, fetchStudentDetail } from "@/api/student";
import type { ExamTimetableEntry } from "@/api/admit-card";
import { Button } from "@/components/ui/button";

export interface AdmitCardStudentInfo {
  id: number;
  name: string;
  fatherName: string;
  motherName: string;
  className: string;
  rollNo: string;
  scholarNo: string;
}

interface AdmitCardProps {
  student: AdmitCardStudentInfo;
  examName: string;
  sessionName: string;
  timetable: ExamTimetableEntry[];
  compact?: boolean;
}

export default function AdmitCard({
  student,
  examName,
  sessionName,
  timetable,
  compact = false,
}: AdmitCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [downloading, setDownloading] = useState<"png" | "pdf" | null>(null);
  const [fatherName, setFatherName] = useState(student.fatherName);
  const [motherName, setMotherName] = useState(student.motherName);

  useEffect(() => {
    if (!student?.id) return;
    fetchStudentPhoto(student.id)
      .then(async (data) => {
        if (data?.filePath) {
          const url = await getPhotoBlobUrl(data.filePath);
          setPhotoUrl(url);
        }
      })
      .catch(() => {});
  }, [student?.id]);

  useEffect(() => {
    if (!student?.id) return;
    fetchStudentDetail(student.id).then((detail) => {
      if (detail?.student) {
        if (detail.student.father_name) setFatherName(detail.student.father_name);
        if (detail.student.mother_name) setMotherName(detail.student.mother_name);
      }
    }).catch(() => {});
  }, [student?.id]);

  const handlePrint = () => window.print();

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setDownloading("png");
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const link = document.createElement("a");
      link.download = `Admit_Card_${student.name.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download PNG:", err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloading("pdf");
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const cardWidth = 190;
      const imgWidth = cardRef.current.offsetWidth;
      const imgHeight = cardRef.current.offsetHeight;
      const cardHeight = (cardWidth * imgHeight) / imgWidth;
      pdf.addImage(dataUrl, "PNG", 10, 10, cardWidth, cardHeight);
      pdf.save(`Admit_Card_${student.name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setDownloading(null);
    }
  };

  // Group timetable by date
  const groupedByDate = timetable.reduce<Record<string, ExamTimetableEntry[]>>((acc, entry) => {
    const date = entry.date || "Unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort();

  // ─── Compact mode (for bulk A4 2×2) ──────────────────────────────
  if (compact) {
    return (
      <div className="border border-slate-300 rounded overflow-hidden flex flex-col text-[6.5px] leading-tight h-full bg-white">
        {/* Header */}
        <div className="bg-[#1a2b4c] px-1.5 py-1 flex items-center gap-1">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white shrink-0">
            <img src="/LOGO.jpg.jpeg" alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
          <div className="text-white leading-tight min-w-0 flex-1">
            <p className="font-bold text-[7px] font-serif leading-tight">ROSE CONVENT HIGH SCHOOL</p>
            <p className="text-[4.5px] text-white/70 leading-tight">Tikuriyatola, Satna (M.P.)</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded px-1 py-0.5 text-center shrink-0">
            <p className="text-white font-bold text-[5px] leading-tight">ADMIT</p>
            <p className="text-white/70 text-[3.5px] uppercase leading-tight">Exam</p>
          </div>
        </div>

        {/* Exam Info */}
        <div className="bg-amber-50 border-b border-amber-200 px-1.5 py-0.5 flex items-center justify-between gap-1 text-[5px]">
          <span className="font-semibold text-slate-700">
            Exam: <span className="font-bold text-[#1a2b4c]">{examName}</span>
          </span>
          <span className="font-semibold text-slate-700">
            Session: <span className="font-bold text-[#1a2b4c]">{sessionName}</span>
          </span>
        </div>

        {/* Body */}
        <div className="p-1.5 flex-1 flex flex-col gap-1">
          <div className="flex gap-1.5">
            <div className="flex-1 min-w-0 space-y-px">
              <p className="font-bold text-[#1a2b4c] text-[5.5px] border-b border-[#1a2b4c]/10 pb-px mb-px">Student Details</p>
              <InfoRow label="Name" value={student.name} compact />
              <InfoRow label="Father" value={fatherName} compact />
              <InfoRow label="Mother" value={motherName} compact />
              <InfoRow label="Class" value={student.className} compact />
              <InfoRow label="Roll" value={student.rollNo} compact />
              <InfoRow label="Scholar" value={student.scholarNo} compact />
            </div>
            <div className="flex flex-col items-center shrink-0">
              <div className="w-[18mm] h-[22mm] border border-[#1a2b4c]/20 p-0.5 bg-white overflow-hidden rounded">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[4px] font-bold text-center rounded">No Photo</div>
                )}
              </div>
            </div>
          </div>

          {/* Timetable */}
          <div className="mt-auto">
            <p className="font-bold text-[#1a2b4c] text-[5.5px] border-b border-[#1a2b4c]/10 pb-px mb-px">Exam Timetable</p>
            {sortedDates.length === 0 ? (
              <p className="text-[4.5px] text-slate-400 italic">No timetable</p>
            ) : (
              <table className="w-full text-[4.5px] border-collapse">
                <thead>
                  <tr className="bg-[#1a2b4c] text-white">
                    <th className="px-0.5 py-px text-left font-semibold">Date</th>
                    <th className="px-0.5 py-px text-left font-semibold">Day</th>
                    <th className="px-0.5 py-px text-left font-semibold">Subject</th>
                    <th className="px-0.5 py-px text-left font-semibold">Time</th>
                    <th className="px-0.5 py-px text-center font-semibold">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDates.map((date) =>
                    groupedByDate[date].map((entry, eidx) => (
                      <tr key={`${date}-${eidx}`} className={eidx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-0.5 py-px font-medium text-slate-700 border-b border-slate-100">{entry.date}</td>
                        <td className="px-0.5 py-px text-slate-600 border-b border-slate-100">{entry.day}</td>
                        <td className="px-0.5 py-px font-semibold text-slate-900 border-b border-slate-100">{entry.subject}</td>
                        <td className="px-0.5 py-px text-slate-600 border-b border-slate-100">{entry.startTime}</td>
                        <td className="px-0.5 py-px text-center font-semibold text-slate-700 border-b border-slate-100">{entry.maxMarks ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Signature */}
          <div className="flex justify-between mt-0.5">
            <div className="border-t border-slate-300 pt-px text-center w-[45%]">
              <p className="text-[3.5px] font-semibold text-slate-500 uppercase">Class Teacher</p>
            </div>
            <div className="border-t border-slate-300 pt-px text-center w-[45%]">
              <p className="text-[3.5px] font-semibold text-slate-500 uppercase">Principal</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1a2b4c] px-1.5 py-px text-center">
          <p className="text-[3.5px] text-white/60 uppercase tracking-widest">Computer generated admit card</p>
        </div>
      </div>
    );
  }

  // ─── Full-size mode (standalone) ─────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 print-hidden" id="admit-card-actions">
        <Button onClick={handlePrint} className="gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white shadow-md">
          <Printer className="h-4 w-4" /> Print
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

      {/* Admit Card */}
      <div
        ref={cardRef}
        id="admit-card-container"
        className="w-full max-w-[210mm] bg-white shadow-2xl border border-slate-200 overflow-hidden rounded-sm"
      >
        {/* ─── Decorative top border ─── */}
        <div className="h-1 bg-linear-to-r from-[#1a2b4c] via-amber-500 to-[#1a2b4c]" />

        {/* ─── HEADER ─── */}
        <div className="bg-[#1a2b4c] px-5 py-3 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shrink-0 shadow-sm">
            <img
              src="/LOGO.jpg.jpeg"
              alt="School Logo"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <div className="text-white">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-wide">ROSE CONVENT</h1>
            <h2 className="text-sm sm:text-base font-bold font-serif tracking-[0.15em] text-white/90">HIGH SCHOOL</h2>
            <p className="text-[11px] text-white/80 font-medium">Tikuriyatola, Satna (M.P.)</p>
          </div>
          <div className="ml-auto">
            <div className="bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-center">
              <p className="text-white font-bold text-sm tracking-wider">ADMIT CARD</p>
              <p className="text-white/70 text-[9px] uppercase tracking-widest">Examination</p>
            </div>
          </div>
        </div>

        {/* ─── EXAM INFO BAR ─── */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Exam:</span>
            <span className="font-bold text-[#1a2b4c] bg-white px-2.5 py-0.5 rounded border border-amber-200">{examName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Session:</span>
            <span className="font-bold text-[#1a2b4c] bg-white px-2.5 py-0.5 rounded border border-amber-200">{sessionName}</span>
          </div>
        </div>

        {/* ─── BODY ─── */}
        <div className="p-4">
          <div className="flex gap-4">
            {/* Left: Student Info */}
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-bold text-[#1a2b4c] border-b-2 border-[#1a2b4c]/10 pb-1 mb-2">
                Student Details
              </h3>
              <div className="grid grid-cols-[90px_auto] gap-x-2 gap-y-2 text-xs">
                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-bold text-slate-900 uppercase">: {student.name}</span>
                <span className="text-slate-500 font-medium">Father's Name</span>
                <span className="font-bold text-slate-900">: {fatherName}</span>
                <span className="text-slate-500 font-medium">Mother's Name</span>
                <span className="font-bold text-slate-900">: {motherName}</span>
                <span className="text-slate-500 font-medium">Class</span>
                <span className="font-bold text-slate-900">: {student.className}</span>
                <span className="text-slate-500 font-medium">Roll No.</span>
                <span className="font-bold text-slate-900">: {student.rollNo}</span>
                <span className="text-slate-500 font-medium">Scholar No.</span>
                <span className="font-bold text-slate-900">: {student.scholarNo}</span>
              </div>
            </div>

            {/* Right: Photo */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-28 h-33 border-2 border-[#1a2b4c]/20 p-1 bg-white shadow-sm overflow-hidden rounded">
                {photoUrl ? (
                  <img src={photoUrl} alt="Student" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-bold text-center rounded">
                    No Photo
                  </div>
                )}
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Student Photo</p>
            </div>
          </div>

          {/* ─── TIMETABLE ─── */}
          <div className="mt-4">
            <h3 className="text-sm font-bold text-[#1a2b4c] border-b-2 border-[#1a2b4c]/10 pb-1 mb-2">
              Exam Timetable
            </h3>
            {sortedDates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No timetable available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1a2b4c] text-white">
                      <th className="px-2.5 py-1.5 text-left font-semibold">Date</th>
                      <th className="px-2.5 py-1.5 text-left font-semibold">Day</th>
                      <th className="px-2.5 py-1.5 text-left font-semibold">Subject</th>
                      <th className="px-2.5 py-1.5 text-left font-semibold">Time</th>
                      <th className="px-2.5 py-1.5 text-center font-semibold">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDates.map((date) =>
                      groupedByDate[date].map((entry, idx) => (
                        <tr key={`${date}-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-2.5 py-1.5 font-medium text-slate-700 border-b border-slate-100">{entry.date}</td>
                          <td className="px-2.5 py-1.5 text-slate-600 border-b border-slate-100">{entry.day}</td>
                          <td className="px-2.5 py-1.5 font-semibold text-slate-900 border-b border-slate-100">{entry.subject}</td>
                          <td className="px-2.5 py-1.5 text-slate-600 border-b border-slate-100">{entry.startTime} - {entry.endTime}</td>
                          <td className="px-2.5 py-1.5 text-center font-semibold text-slate-700 border-b border-slate-100">{entry.maxMarks ?? "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─── SIGNATURE ─── */}
          <div className="mt-5 flex justify-between items-end">
            <div className="text-center">
              <div className="w-36 border-t-2 border-slate-300 pt-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Class Teacher</p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-36 border-t-2 border-slate-300 pt-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="bg-[#1a2b4c] px-5 py-1.5 text-center">
          <p className="text-[9px] text-white/60 uppercase tracking-widest">
            This is a computer-generated admit card. No signature required.
          </p>
        </div>

        {/* ─── Decorative bottom border ─── */}
        <div className="h-1 bg-linear-to-r from-[#1a2b4c] via-amber-500 to-[#1a2b4c]" />
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          body, html { margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #admit-card-container, #admit-card-container * { visibility: visible; }
          #admit-card-container {
            position: absolute;
            left: 0;
            top: 0;
            max-width: 100%;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #admit-card-actions { display: none !important; }
          .print-hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}

function InfoRow({ label, value, compact: isCompact }: { label: string; value: string; compact?: boolean }) {
  const textClass = isCompact ? "text-[4.5px]" : "text-xs";
  return (
    <div className={`flex ${textClass}`}>
      <span className="text-slate-500 font-medium w-[7mm] shrink-0">{label}</span>
      <span className="font-semibold text-slate-900 truncate">: {value || "—"}</span>
    </div>
  );
}

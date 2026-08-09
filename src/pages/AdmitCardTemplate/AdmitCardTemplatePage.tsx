import { useState, useRef } from "react";
import { Download, Printer, Upload, X, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdmitCardTemplatePage() {
  const templateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"png" | "pdf" | null>(null);
  const [slotImages, setSlotImages] = useState<(string | null)[]>([null, null, null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const handleSlotClick = (idx: number) => {
    setActiveSlot(idx);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setSlotImages((prev) => {
        const next = [...prev];
        next[activeSlot] = dataUrl;
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setSlotImages((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

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
      link.download = "Admit_Card_Template.png";
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
      pdf.save("Admit_Card_Template.pdf");
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setDownloading(null);
    }
  };

  const filledCount = slotImages.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#1a2b4c]" />
            Admit Card Template
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload up to 4 admit card images and arrange them on an A4 page. Click each slot to upload a PNG image.
          </p>
        </div>

        {/* ─── Action Buttons ─── */}
        <div className="flex flex-wrap gap-3 mb-6 print-hidden">
          <Button onClick={handlePrint} className="gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white shadow-md">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button
            onClick={handleDownloadPNG}
            disabled={downloading === "png"}
            className="gap-2 bg-[#0d9488] hover:bg-[#0a7a6f] text-white shadow-md"
          >
            {downloading === "png" ? (
              <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
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
              <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
            ) : (
              <Download className="h-4 w-4" />
            )}{" "}
            Download PDF
          </Button>
          {filledCount > 0 && (
            <Button
              variant="outline"
              className="gap-2 text-slate-500"
              onClick={() => setSlotImages([null, null, null, null])}
            >
              <X className="h-4 w-4" /> Clear All
            </Button>
          )}
        </div>

        {/* ─── Hidden file input ─── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* ─── A4 Template ─── */}
        <div className="flex justify-center">
          <div
            ref={templateRef}
            id="admit-card-template"
            className="w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-200 p-[8mm] print:p-0 print:shadow-none print:border-none"
          >
            {/* School Header */}
            <div className="text-center mb-3 pb-2 border-b-2 border-[#1a2b4c]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300">
                  <img src="/LOGO.jpg.jpeg" alt="Logo" className="w-full h-full object-cover" crossOrigin="anonymous" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-serif text-[#1a2b4c] leading-tight">ROSE CONVENT HIGH SCHOOL</h2>
                  <p className="text-[8px] text-slate-500">Tikuriyatola, Satna (M.P.)</p>
                </div>
              </div>
              <p className="text-[9px] font-bold text-[#1a2b4c] uppercase tracking-wider mt-1">Admit Card Template</p>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-[6mm]">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-[#1a2b4c] hover:bg-slate-50/50 transition-colors min-h-[120mm] group"
                  onClick={() => handleSlotClick(idx)}
                >
                  {slotImages[idx] ? (
                    <>
                      <img
                        src={slotImages[idx]!}
                        alt={`Admit Card ${idx + 1}`}
                        className="w-full h-full object-contain absolute inset-0"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-1.5 right-1.5 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden shadow-md hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 print:hidden px-4">
                      <Upload className="h-8 w-8" />
                      <span className="text-xs font-medium">Click to upload</span>
                      <span className="text-[9px] text-slate-300">Slot {idx + 1}</span>
                    </div>
                  )}
                  {/* Slot label */}
                  <div className="absolute bottom-1.5 left-1.5 text-[7px] font-mono text-slate-400 bg-white/80 px-1 py-0.5 rounded">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-slate-200 text-center">
              <p className="text-[7px] text-slate-400 uppercase tracking-widest">
                Computer generated admit card template
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body, html { margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #admit-card-template, #admit-card-template * { visibility: visible; }
          #admit-card-template {
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
          .print-hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}

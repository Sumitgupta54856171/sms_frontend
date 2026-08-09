import { useState, useRef } from "react";
import { Download, Printer, Upload, ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import IDCard from "@/components/IdCard";

export default function SecondIdCardGenerator() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"png" | "pdf" | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    scholarNo: "",
    classInfo: "",
    address: "Satna (M.P.)",
  });

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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
      link.download = `ID_Card_${formData.name.replace(/\s+/g, "_") || "Student"}.png`;
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
      const imgWidth = 190;
      const cardWidth = cardRef.current.offsetWidth;
      const cardHeight = cardRef.current.offsetHeight;
      const imgHeight = (imgWidth * cardHeight) / cardWidth;
      pdf.addImage(dataUrl, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`ID_Card_${formData.name.replace(/\s+/g, "_") || "Student"}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setDownloading(null);
    }
  };

  // Build student object for IDCard
  const studentData = {
    id: 0,
    name: formData.name || "Student Name",
    father_name: formData.fatherName || "Father Name",
    mother_name: formData.motherName || "",
    scholar_no: formData.scholarNo || "—",
    classInfo: formData.classInfo || "Class",
    address: formData.address || "Satna (M.P.)",
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-[#1a2b4c]" />
            Second ID Card Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter student details and generate a 85×55mm ID card. Preview updates instantly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ─── LEFT: FORM ─── */}
          <Card className="w-full lg:w-105 shrink-0 border-slate-200">
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4">Student Details</h2>

              <div className="space-y-3.5">
                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Student Photo</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                      {photoDataUrl ? (
                        <img src={photoDataUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <Upload className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <Label
                      htmlFor="photo-upload"
                      className="flex-1 cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm py-2 px-3 rounded-md text-center flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="h-4 w-4" /> Upload Photo
                    </Label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Student Name</Label>
                  <Input
                    name="name"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Father's Name</Label>
                  <Input
                    name="fatherName"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600">Scholar No.</Label>
                    <Input
                      name="scholarNo"
                      placeholder="e.g. 12345"
                      value={formData.scholarNo}
                      onChange={handleInputChange}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600">Class</Label>
                    <Input
                      name="classInfo"
                      placeholder="e.g. 5 or 10th"
                      value={formData.classInfo}
                      onChange={handleInputChange}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Address</Label>
                  <Input
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* ─── Action Buttons ─── */}
              <div className="mt-6 flex flex-col gap-2.5 print-hidden">
                <Button
                  onClick={handleDownloadPNG}
                  disabled={downloading === "png"}
                  className="w-full gap-2 bg-[#0d9488] hover:bg-[#0a7a6f] text-white"
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
                  className="w-full gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                >
                  {downloading === "pdf" ? (
                    <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}{" "}
                  Download PDF
                </Button>
                <Button
                  onClick={handlePrint}
                  className="w-full gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white"
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ─── RIGHT: PREVIEW ─── */}
          <div className="flex-1 flex flex-col items-center">
            <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">Live Preview</p>
            <div ref={cardRef} className="overflow-auto max-w-full">
              <IDCard student={studentData} customPhotoUrl={photoDataUrl || undefined} previewMode />
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body, html { margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #id-card-container, #id-card-container * { visibility: visible; }
          #id-card-container {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            border: 2px solid #ccc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}

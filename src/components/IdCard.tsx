import { useState, useEffect } from "react";
import { Printer, Download } from "lucide-react";
import { fetchStudentPhoto, getPhotoBlobUrl } from "@/api/student";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface IDCardStudent {
  id: number;
  name: string;
  father_name?: string;
  mother_name?: string;
  scholar_no?: string;
  classInfo?: string;
  roll?: string;
  phone?: string;
  address?: string;
}

interface IDCardProps {
  student?: IDCardStudent;
  principalName?: string;
}

// Default mock student for preview purposes
const defaultStudent: IDCardStudent = {
  id: 1,
  name: "Aarav Sharma",
  father_name: "Rajesh Sharma",
  scholar_no: "2023/4059",
  classInfo: "10 / B",
  roll: "42",
  phone: "+91 9876543210",
  address: "123, Sunrise Apartments, Near Station Road, Tikuriyatola, Satna (M.P.)"
};

/** Adds ordinal suffix (st, nd, rd, th) to a class number */
function formatClassWithSuffix(classInfo: string): string {
  const match = classInfo.match(/^(\d+)(.*)/);
  if (!match) return classInfo;

  const num = parseInt(match[1], 10);
  const rest = match[2]; 

  let suffix = "th";
  if (num % 10 === 1 && num % 100 !== 11) suffix = "st";
  else if (num % 10 === 2 && num % 100 !== 12) suffix = "nd";
  else if (num % 10 === 3 && num % 100 !== 13) suffix = "rd";

  return `${num}${suffix}${rest}`;
}

export default function IDCard({ student = defaultStudent, principalName = "Dr. Sharma" }: IDCardProps) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!student?.id) return;
    fetchStudentPhoto(student.id)
      .then(async (data) => {
        if (data?.filePath) {
          const url = await getPhotoBlobUrl(data.filePath);
          setPhotoUrl(url);
        }
      })
      .catch((err) => console.error("Error fetching photo:", err));
  }, [student?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    const cardElement = document.getElementById("id-card-container");
    if (!cardElement) return;

    try {
      const dataUrl = await toPng(cardElement, {
        quality: 1.0,
        pixelRatio: 4, 
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)", 
          transformOrigin: "top left"
        }
      });

      const link = document.createElement("a");
      link.download = `ID_Card_${student.name.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download ID card:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body, html { margin: 0; padding: 0; background-color: white; }
          body * { visibility: hidden; }
          #id-card-container, #id-card-container * { visibility: visible; }
          #id-card-container { 
            position: absolute; 
            left: 0; 
            top: 0;
            transform: none !important; 
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            box-shadow: none !important;
          }
          #print-btn { display: none !important; }
        }
      `}} />

      <div id="print-btn" className="mb-6 flex gap-3">
        <Button onClick={handlePrint} className="gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white shadow-md">
          <Printer className="h-4 w-4" /> Print ID Card
        </Button>
        <Button onClick={handleDownloadPNG} className="gap-2 bg-[#0d9488] hover:bg-[#0a7a6f] text-white shadow-md">
          <Download className="h-4 w-4" /> Download PNG
        </Button>
      </div>

      <Card
        id="id-card-container"
        className="w-[360px] h-[540px] bg-white rounded-2xl shadow-2xl relative overflow-hidden border-2 border-slate-200 flex flex-col box-border"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center z-0">
          <svg viewBox="0 0 100 100" className="w-56 h-56 fill-current text-slate-900">
            <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
            <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" fill="white" />
          </svg>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="relative h-[115px] w-full shrink-0 z-10 bg-white">
          <div
            className="absolute top-0 left-0 w-full h-[105px] bg-[#1a2b4c] z-10"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)" }}
          ></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#e6b1b1] rounded-full opacity-60 z-0"></div>
          <div className="absolute top-8 -right-8 w-24 h-32 bg-[#93c572] rounded-full opacity-70 transform rotate-12 z-0"></div>

          <div className="absolute top-0 left-0 w-full h-full z-20 flex items-start px-4 pt-3">
            <div className="w-[45px] h-[45px] bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 flex-shrink-0 mt-1">
              <img src="/LOGO.jpg.jpeg" alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
            <div className="ml-3 flex flex-col justify-start pt-0.5">
              <h1 className="text-[20px] font-bold text-white font-serif leading-tight tracking-wide">
                ROSE CONVENT
              </h1>
              <h2 className="text-[14px] font-bold text-white/90 font-serif tracking-[0.2em] pl-0.5">
                HIGH SCHOOL
              </h2>
              <p className="text-[9px] text-white/80 font-medium tracking-wide mt-0.5">
                Tikuriyatola, Satna (M.P.)
              </p>
            </div>
          </div>

          <div className="absolute bottom-[2px] left-0 w-full flex justify-center z-30">
            <div className="bg-white text-[#1a2b4c] text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-[3px] rounded-full border border-slate-200 shadow-sm">
              Student Identity Card
            </div>
          </div>
        </div>

        {/* --- BODY SECTION --- */}
        {/* Added pb-16 to ensure bottom content doesn't overlap with absolute signature */}
        <div className="flex-1 flex flex-col items-center px-5 pt-2 pb-16 z-10 w-full relative">

          {/* Photo */}
          <div className="flex flex-col items-center w-full">
            <div className="w-[100px] h-[115px] border-[2px] border-[#1a2b4c]/20 p-[2px] bg-white shadow-md overflow-hidden rounded-lg">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Student"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold text-center rounded-md">
                  No Photo
                </div>
              )}
            </div>

            {/* Student Name */}
            <h3 className="mt-2 text-[16px] font-extrabold text-[#1a2b4c] uppercase tracking-wide font-serif text-center leading-tight px-1 w-full">
              {student?.name || "Student Name"}
            </h3>

            {/* Scholar No badge */}
            <div className="mt-1 bg-[#1a2b4c]/5 px-3 py-[2px] rounded-full">
              <p className="text-[10px] text-[#1a2b4c] font-bold tracking-wide">
                Sch. No. {student?.scholar_no || "—"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full mt-2 mb-2 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"></div>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Details List */}
          <div className="w-full space-y-[4px] font-sans flex flex-col justify-center">
            <div className="flex text-[12px] items-center">
              <div className="w-[85px] shrink-0 text-slate-500 font-medium">Father's Name</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[12px] leading-snug truncate">
                {student?.father_name || "—"}
              </div>
            </div>

            <div className="flex text-[12px] items-center">
              <div className="w-[85px] shrink-0 text-slate-500 font-medium">Class / Sec.</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[12px] leading-snug">
                {student?.classInfo ? formatClassWithSuffix(student.classInfo) : "—"}
              </div>
            </div>

            <div className="flex text-[12px] items-center">
              <div className="w-[85px] shrink-0 text-slate-500 font-medium">Roll No.</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[12px] leading-snug">
                {student?.roll || "—"}
              </div>
            </div>

            <div className="flex text-[12px] items-center">
              <div className="w-[85px] shrink-0 text-slate-500 font-medium">Mob. No.</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[12px] leading-snug">
                {student?.phone || "—"}
              </div>
            </div>

            <div className="flex text-[11px] items-start">
              <div className="w-[85px] shrink-0 text-slate-500 font-medium pt-[1px]">Address</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center pt-[1px]">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[11px] leading-tight line-clamp-2">
                {student?.address || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER & SIGNATURE --- */}
        {/* Changed to Absolute Positioning to prevent cutoff */}
        <div className="absolute bottom-4 right-5 z-20">
          <div className="flex flex-col items-center">
            <svg className="w-16 h-8 text-slate-800" viewBox="0 0 80 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 16 C 15 2 25 22 35 12 C 45 2 55 20 65 14 Q 72 20 78 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-[10px] font-bold text-[#1a2b4c] border-t-2 border-[#1a2b4c] pt-[2px] px-2 uppercase tracking-widest mt-0.5">
              Principal
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
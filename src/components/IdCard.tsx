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
  // Extract the leading number from classInfo (e.g., "10 / B" → "10")
  const match = classInfo.match(/^(\d+)(.*)/);
  if (!match) return classInfo;

  const num = parseInt(match[1], 10);
  const rest = match[2]; // e.g., " / B" or ""

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
        pixelRatio: 8,
        backgroundColor: "#ffffff",
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
      {/* CSS for Print Mode */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #id-card-container, #id-card-container * { visibility: visible; }
          #id-card-container { 
            position: absolute; 
            left: 50%; 
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            box-shadow: none !important;
          }
          #print-btn { display: none; }
        }
      `}} />

      {/* Print Button */}
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
        className="w-[360px] h-[540px] bg-white rounded-2xl shadow-2xl relative overflow-hidden border-2 border-slate-200 flex flex-col"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center z-0">
          <svg viewBox="0 0 100 100" className="w-56 h-56 fill-current text-slate-900">
            <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
            <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" fill="white" />
          </svg>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="relative h-[120px] w-full shrink-0 z-10">
          <div
            className="absolute top-0 left-0 w-full h-[110px] bg-[#1a2b4c] z-10"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)" }}
          ></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#e6b1b1] rounded-full opacity-60 z-0"></div>
          <div className="absolute top-8 -right-8 w-24 h-32 bg-[#93c572] rounded-full opacity-70 transform rotate-12 z-0"></div>

          <div className="absolute top-0 left-0 w-full h-full z-20 flex items-start px-4 pt-3">
            <div className="w-[50px] h-[50px] bg-white/90 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 flex-shrink-0 mt-1">
              <img src="/LOGO.jpg.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="ml-3 flex flex-col justify-start pt-0.5">
              <h1 className="text-[22px] font-bold text-white font-serif leading-tight tracking-wide">
                ROSE CONVENT
              </h1>
              <h2 className="text-[15px] font-bold text-white/90 font-serif tracking-[0.2em] pl-0.5">
                HIGH SCHOOL
              </h2>
              <p className="text-[10px] text-white/80 font-medium tracking-wide mt-0.5">
                Tikuriyatola, Satna (M.P.)
              </p>
            </div>
          </div>

          <div className="absolute bottom-[6px] left-0 w-full flex justify-center z-30">
            <div className="bg-white/95 text-[#1a2b4c] text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-[4px] rounded-full border border-slate-200 shadow-sm backdrop-blur-sm">
              Student Identity Card
            </div>
          </div>
        </div>

        {/* --- BODY SECTION --- */}
        <div className="flex-1 flex flex-col items-center px-5 pt-3 pb-2 z-10 w-full">

          {/* Photo */}
          <div className="flex flex-col items-center w-full">
            <div className="w-[110px] h-[125px] border-[2.5px] border-[#1a2b4c]/20 p-[3px] bg-white shadow-md overflow-hidden rounded-lg">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Student"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm font-bold text-center rounded-md">
                  No Photo
                </div>
              )}
            </div>

            {/* Student Name — FIRST */}
            <h3 className="mt-2.5 text-[17px] font-extrabold text-[#1a2b4c] uppercase tracking-wide font-serif text-center leading-tight px-2 w-full">
              {student?.name || "Student Name"}
            </h3>

            {/* Scholar No badge */}
            <div className="mt-1 bg-[#1a2b4c]/5 px-3 py-[2px] rounded-full">
              <p className="text-[11px] text-[#1a2b4c] font-bold tracking-wide">
                Sch. No. {student?.scholar_no || "—"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full mt-3 mb-2 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"></div>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Details List */}
          <div className="w-full space-y-[6px] font-sans flex flex-col justify-center flex-1">

            {/* Father's Name */}
            <div className="flex text-[13px] items-center">
              <div className="w-[90px] shrink-0 text-slate-500 font-medium">Father's Name</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[13px] leading-snug break-words">
                {student?.father_name || "—"}
              </div>
            </div>

            <div className="flex text-[13px] items-center">
              <div className="w-[90px] shrink-0 text-slate-500 font-medium">Class / Sec.</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[13px] leading-snug">
                {student?.classInfo ? formatClassWithSuffix(student.classInfo) : "—"}
              </div>
            </div>

            <div className="flex text-[13px] items-center">
              <div className="w-[90px] shrink-0 text-slate-500 font-medium">Roll No.</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[13px] leading-snug">
                {student?.roll || "—"}
              </div>
            </div>

            <div className="flex text-[13px] items-center">
              <div className="w-[90px] shrink-0 text-slate-500 font-medium">Mob. No.</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[13px] leading-snug">
                {student?.phone || "—"}
              </div>
            </div>

            <div className="flex text-[12px] items-start">
              <div className="w-[90px] shrink-0 text-slate-500 font-medium pt-[1px]">Address</div>
              <div className="w-[10px] shrink-0 text-slate-400 font-bold text-center pt-[1px]">:</div>
              <div className="flex-1 font-bold text-slate-900 text-[12px] leading-snug break-words line-clamp-2">
                {student?.address || "—"}
              </div>
            </div>

          </div>
        </div>

        {/* --- FOOTER & SIGNATURE --- */}
        <div className="w-full shrink-0 mt-auto z-20">
          <div className="flex justify-end items-end px-5 pb-1.5">
            <div className="text-center">
              <svg className="w-24 h-4 text-green-700 opacity-60 mx-auto" viewBox="0 0 80 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 20 Q15 2 25 12 Q35 22 45 8 Q55 -2 65 14 Q72 22 78 16" strokeLinecap="round" />
              </svg>
              <div className="text-[8px] font-extrabold text-[#1a2b4c] border-t-[1.5px] border-[#1a2b4c]">
                principal
              </div>
            </div>
          </div>

          
          
        </div>
      </Card>
    </div>
  );
}
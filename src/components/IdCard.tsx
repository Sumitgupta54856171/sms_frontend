import React, { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { fetchStudentPhoto, getPhotoBlobUrl } from "@/api/student";

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
}

// Default mock student for preview purposes
const defaultStudent: IDCardStudent = {
  id: 1,
  name: "Aarav Sharma",
  father_name: "Rajesh Sharma",
  scholar_no: "2023/4059",
  classInfo: "10th / B",
  roll: "42",
  phone: "+91 9876543210",
  address: "123, Sunrise Apartments, Near Station Road, Tikuriyatola, Satna (M.P.)" // Long address to test wrapping
};

export default function IDCard({ student = defaultStudent }: IDCardProps) {
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
      <div id="print-btn" className="mb-6">
        <Button onClick={handlePrint} className="gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white shadow-md">
          <Printer className="h-4 w-4" /> Print ID Card
        </Button>
      </div>

      {/* --- ID CARD START --- */}
      {/* Changed to flex-col to naturally stack elements and prevent overlaps */}
      <Card
        id="id-card-container"
        className="w-[320px] h-[490px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border-2 border-slate-200 flex flex-col"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center z-0">
          <svg viewBox="0 0 100 100" className="w-48 h-48 fill-current text-slate-900">
            <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
            <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" fill="white" />
          </svg>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="relative h-[130px] w-full shrink-0 z-10">
          <div
            className="absolute top-0 left-0 w-full h-[120px] bg-[#1a2b4c] z-10"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 100%)" }}
          ></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#e6b1b1] rounded-full opacity-60 z-0"></div>
          <div className="absolute top-8 -right-8 w-24 h-32 bg-[#93c572] rounded-full opacity-70 transform rotate-12 z-0"></div>

          <div className="absolute top-0 left-0 w-full h-full z-20 flex px-3 pt-3">
            <div className="w-[45px] h-[45px] bg-white/90 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 flex-shrink-0 mt-1">
              <img src="/LOGO.jpg.jpeg" alt="" />
            </div>
            <div className="ml-2 flex flex-col justify-start pt-1">
              <h1 className="text-[20px] font-bold text-white font-serif leading-[1.1] tracking-wide">
                ROSE CONVENT
              </h1>
              <h2 className="text-[14px] font-bold text-white font-serif tracking-widest pl-2">
                HIGH SCHOOL
              </h2>
            </div>
          </div>

          <div className="absolute bottom-[2px] left-0 w-full flex justify-center z-30">
            <div className="bg-[#f0f4f8] text-[#1a2b4c] text-[10px] font-bold uppercase tracking-widest px-4 py-[3px] rounded-full border border-slate-200 shadow-sm">
              Student Identity Card
            </div>
          </div>
        </div>

        {}
        {/* --- BODY SECTION (Photo + Details) --- */}
        <div className="flex-1 flex flex-col items-center px-4 pt-1 pb-2 z-10 w-full">
          
          {/* Photo & Name */}
          <div className="flex flex-col items-center w-full">
            <div className="w-[90px] h-[105px] border-[2px] border-slate-200 p-1 bg-white shadow-sm overflow-hidden rounded-sm">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Student"
                  className="w-full h-full object-cover rounded-sm"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold text-center">
                  No Photo
                </div>
              )}
            </div>
            <h3 className="mt-2 text-[14px] font-extrabold text-[#1f3bb3] uppercase tracking-wide font-serif text-center leading-tight px-1 w-full truncate">
              {student?.name || "Student Name"}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              Sch. No. {student?.scholar_no || "—"}
            </p>
          </div>

          {}
          {/* Details List */}
          <div className="w-full mt-2 space-y-[4px] font-sans flex flex-col justify-center flex-1">
            
            <div className="flex text-[11px] items-start">
              <div className="w-[80px] shrink-0 text-slate-700 tracking-wide">Father's Name</div>
              <div className="w-[8px] shrink-0 text-slate-700 font-bold">:</div>
              <div className="flex-1 font-bold text-slate-900 uppercase text-[11px] leading-tight break-words line-clamp-1">
                {student?.father_name || "—"}
              </div>
            </div>

            <div className="flex text-[11px] items-start">
              <div className="w-[80px] shrink-0 text-slate-700 tracking-wide">Class/Sec.</div>
              <div className="w-[8px] shrink-0 text-slate-700 font-bold">:</div>
              <div className="flex-1 font-bold text-slate-900 uppercase text-[11px] leading-tight break-words">
                {student?.classInfo || "—"}
              </div>
            </div>

            <div className="flex text-[11px] items-start">
              <div className="w-[80px] shrink-0 text-slate-700 tracking-wide">Roll No.</div>
              <div className="w-[8px] shrink-0 text-slate-700 font-bold">:</div>
              <div className="flex-1 font-bold text-slate-900 uppercase text-[11px] leading-tight break-words">
                {student?.roll || "—"}
              </div>
            </div>

            <div className="flex text-[11px] items-start">
              <div className="w-[80px] shrink-0 text-slate-700 tracking-wide">Mob. No.</div>
              <div className="w-[8px] shrink-0 text-slate-700 font-bold">:</div>
              <div className="flex-1 font-bold text-slate-900 uppercase text-[11px] leading-tight break-words">
                {student?.phone || "—"}
              </div>
            </div>

            {/* Address uses line-clamp-2 to prevent it from growing infinitely */}
            <div className="flex text-[11px] items-start">
              <div className="w-[80px] shrink-0 text-slate-700 tracking-wide">Address</div>
              <div className="w-[8px] shrink-0 text-slate-700 font-bold">:</div>
              <div className="flex-1 font-bold text-slate-900 uppercase text-[10px] leading-tight break-words line-clamp-2">
                {student?.address || "—"}
              </div>
            </div>

          </div>
        </div>

        {}
        {/* --- FOOTER & SIGNATURE --- */}
        {/* mt-auto forces the footer to the bottom without absolutely positioning it, preventing overlap */}
        <div className="w-full shrink-0 mt-auto z-20">
          <div className="flex justify-end items-end px-4 pb-1">
            {/* Principal Signature */}
            <div className="text-center">
              {/* Signature line */}
              <svg className="w-20 h-5 text-green-700 opacity-70 mx-auto" viewBox="0 0 80 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 20 Q15 2 25 12 Q35 22 45 8 Q55 -2 65 14 Q72 22 78 16" strokeLinecap="round" />
              </svg>
              <div className="text-[11px] font-extrabold text-[#1a2b4c] border-t-[1.5px] border-[#1a2b4c] pt-[2px] px-3">
                Principal
              </div>
            </div>
          </div>

          {/* Bottom Dark Blue Band */}
          <div className="bg-[#1a2b4c] text-white text-center py-2 px-1 w-full">
            <p className="text-[13px] font-black tracking-widest uppercase font-serif">
              Tikuriyatola, Satna
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { fetchStudentPhoto, getPhotoBlobUrl } from "@/api/student";

export interface IdCard85x55Student {
  id: number;
  name: string;
  father_name?: string;
  scholar_no?: string;
  classInfo?: string;
}

interface IdCard85x55Props {
  student: IdCard85x55Student;
  principalName?: string;
  customPhotoUrl?: string;
}

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

export default function IdCard85x55({ student, principalName = "Dr. Sharma", customPhotoUrl }: IdCard85x55Props) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (customPhotoUrl) {
      setPhotoUrl(customPhotoUrl);
      return;
    }
    if (!student?.id) return;
    let cancelled = false;
    fetchStudentPhoto(student.id)
      .then(async (data) => {
        if (cancelled) return;
        if (data?.filePath) {
          const url = await getPhotoBlobUrl(data.filePath);
          if (!cancelled) setPhotoUrl(url);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [student?.id, customPhotoUrl]);

  return (
    <div
      className="id-card-85x55 bg-white rounded-sm overflow-hidden border border-slate-300 flex flex-col relative print:border-slate-400 print:shadow-none shadow-md"
      style={{ width: "55mm", height: "85mm" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center z-0">
        <svg viewBox="0 0 100 100" className="w-40 h-40 fill-current text-slate-900">
          <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
          <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" fill="white" />
        </svg>
      </div>

      {/* ─── HEADER ─── */}
      <div className="relative shrink-0 z-10 bg-white" style={{ height: "14mm" }}>
        <div
          className="absolute top-0 left-0 w-full z-10"
          style={{ height: "12mm", backgroundColor: "#1a2b4c", clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)" }}
        />
        <div className="absolute -top-1 -left-1 w-[10mm] h-[10mm] bg-[#e6b1b1] rounded-full opacity-60 z-0" />
        <div className="absolute top-2 -right-2 w-[12mm] h-[15mm] bg-[#93c572] rounded-full opacity-70 transform rotate-12 z-0" />

        <div className="absolute top-0 left-0 w-full h-full z-20 flex items-start px-[2mm] pt-[1.5mm]">
          <div className="w-[7mm] h-[7mm] bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 shrink-0">
            <img src="/LOGO.jpg.jpeg" alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
          <div className="ml-[1.5mm] flex flex-col justify-start">
            <h1 className="text-[10pt] font-bold text-white font-serif leading-tight tracking-wide">
              ROSE CONVENT
            </h1>
            <h2 className="text-[7.5pt] font-bold text-white/90 font-serif tracking-[0.15em] leading-tight">
              HIGH SCHOOL
            </h2>
            <p className="text-[6pt] text-white/80 font-medium tracking-wide leading-tight">
              Tikuriya Tola, Satna (M.P.)
            </p>
          </div>
        </div>

        <div className="absolute bottom-[0.5mm] left-0 w-full flex justify-center z-30">
          <div className="bg-white text-[#1a2b4c] text-[6pt] font-bold uppercase tracking-[0.1em] px-[2mm] py-[0.3mm] rounded-full border border-slate-200 shadow-sm">
            Student Identity Card
          </div>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="flex-1 flex flex-col items-center px-[2mm] pt-[1mm] pb-[4mm] z-10 w-full overflow-hidden">
        {/* Photo */}
        <div className="flex flex-col items-center w-full">
          <div
            className="border-[1.5px] border-[#1a2b4c]/20 p-[0.5mm] bg-white shadow-sm overflow-hidden rounded-sm"
            style={{ width: "14mm", height: "17mm" }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-sm" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[6pt] font-bold rounded-sm">
                NO PHOTO
              </div>
            )}
          </div>

          {/* Student Name */}
          <h3 className="mt-[0.5mm] text-[10pt] font-extrabold text-[#1a2b4c] uppercase tracking-wide font-serif text-center leading-tight w-full truncate">
            {student.name}
          </h3>

          {/* Scholar No badge */}
          <div className="mt-[0.5mm] bg-[#1a2b4c]/5 px-[1.5mm] py-[0.2mm] rounded-full">
            <p className="text-[7pt] text-[#1a2b4c] font-bold tracking-wide">
              Sch. No. {student.scholar_no || "—"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full mt-[1mm] mb-[0.5mm] flex items-center gap-[1mm] px-[0.5mm]">
          <div className="flex-1 h-[0.5px] bg-slate-300" />
          <div className="w-[0.8mm] h-[0.8mm] rounded-full bg-[#0d9488] shrink-0" />
          <div className="flex-1 h-[0.5px] bg-slate-300" />
        </div>

        {/* Details */}
        <div className="w-full space-y-[0.8mm] font-sans">
          <div className="flex text-[8pt] items-baseline">
            <span className="w-[16mm] shrink-0 text-slate-600 font-semibold">Father's Name</span>
            <span className="w-[1.5mm] shrink-0 text-slate-400 font-bold text-center">:</span>
            <span className="flex-1 font-bold text-slate-900 text-[8pt] leading-snug truncate">
              {student.father_name || "—"}
            </span>
          </div>

          <div className="flex text-[8pt] items-baseline">
            <span className="w-[16mm] shrink-0 text-slate-600 font-semibold">Class / Sec.</span>
            <span className="w-[1.5mm] shrink-0 text-slate-400 font-bold text-center">:</span>
            <span className="flex-1 font-bold text-slate-900 text-[8pt] leading-snug">
              {student.classInfo ? formatClassWithSuffix(student.classInfo) : "—"}
            </span>
          </div>

          <div className="flex text-[8pt] items-baseline">
            <span className="w-[16mm] shrink-0 text-slate-600 font-semibold">City</span>
            <span className="w-[1.5mm] shrink-0 text-slate-400 font-bold text-center">:</span>
            <span className="flex-1 font-bold text-slate-900 text-[8pt] leading-snug">
              Satna (M.P.)
            </span>
          </div>
        </div>
      </div>

      {/* ─── FOOTER / SIGNATURE ─── */}
      <div className="absolute bottom-[1.5mm] right-[2mm] z-20">
        <div className="flex flex-col items-center">
          <svg className="w-[12mm] h-[4mm] text-slate-800" viewBox="0 0 80 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 16 C 15 2 25 22 35 12 C 45 2 55 20 65 14 Q 72 20 78 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-[6pt] font-bold text-[#1a2b4c] border-t-[1px] border-[#1a2b4c] pt-[0.3mm] px-[1mm] uppercase tracking-widest">
            Principal
          </div>
        </div>
      </div>
    </div>
  );
}

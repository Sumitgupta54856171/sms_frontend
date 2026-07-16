import { useState, useEffect } from "react";
import { fetchStudentPhoto, getPhotoBlobUrl } from "@/api/student";

export interface IdCardMiniStudent {
  id: number;
  name: string;
  father_name?: string;
  scholar_no?: string;
  classInfo?: string;
  roll?: string;
}

interface IdCardMiniProps {
  student: IdCardMiniStudent;
  principalName?: string;
}

export default function IdCardMini({ student, principalName = "Dr. Sharma" }: IdCardMiniProps) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
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
  }, [student?.id]);

  return (
    <div 
      className="id-card-mini bg-white rounded-lg overflow-hidden border-2 border-slate-300 flex flex-col relative print:border-slate-400 print:shadow-none"
      style={{ width: '54mm', height: '85mm' }}
    >
      {/* Background watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center z-0">
        <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 fill-current text-slate-900">
          <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
          <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" fill="white" />
        </svg>
      </div>

      {/* ─── HEADER ─── */}
      <div className="relative shrink-0 z-10" style={{ height: '22mm' }}>
        {/* Dark blue background with clip path */}
        <div
          className="absolute top-0 left-0 w-full z-10"
          style={{ height: '19mm', backgroundColor: '#1a2b4c', clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 100%)' }}
        />
        {/* Decorative circles */}
        <div className="absolute top-[-2mm] left-[-1.5mm] w-[12mm] h-[12mm] bg-[#e6b1b1] rounded-full opacity-60 z-0" />
        <div className="absolute top-[4mm] right-[-2mm] w-[12mm] h-[12mm] bg-[#93c572] rounded-full opacity-70 z-0" />

        {/* Logo + School name */}
        <div className="relative z-20 flex items-start px-[3mm] pt-[2mm] h-full">
          <div className="w-[7mm] h-[7mm] bg-white/90 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
            <img src="/LOGO.jpg.jpeg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="ml-[2mm] flex flex-col pt-[0.5mm]">
            <div className="text-[9pt] font-black text-white font-serif leading-tight tracking-wide">
              ROSE CONVENT
            </div>
            <div className="text-[7pt] font-bold text-white/90 font-serif tracking-[0.2em]">
              HIGH SCHOOL
            </div>
          </div>
        </div>

        {/* "Student Identity Card" badge */}
        <div className="absolute bottom-[1mm] left-0 w-full flex justify-center z-30">
          <div className="bg-white/95 text-[#1a2b4c] text-[6pt] font-bold uppercase tracking-[0.15em] px-[4mm] py-[0.8mm] rounded-full border border-slate-200 shadow-sm whitespace-nowrap">
            Student Identity Card
          </div>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="flex-1 flex flex-col items-center px-[4mm] pt-[2mm] pb-[1mm] z-10 overflow-hidden">
        {/* Photo */}
        <div className="flex flex-col items-center w-full">
          <div className="w-[16mm] h-[18mm] border-[1.5px] border-[#1a2b4c]/20 p-[1mm] bg-white shadow-sm overflow-hidden rounded">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-full h-full object-cover rounded" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[6pt] font-bold rounded">
                NO PHOTO
              </div>
            )}
          </div>

          {/* Student Name */}
          <div className="text-[10pt] font-extrabold text-[#1a2b4c] uppercase tracking-wide leading-tight text-center mt-[1.5mm] truncate w-full">
            {student.name}
          </div>

          {/* Scholar No badge */}
          <div className="mt-[1mm] bg-[#1a2b4c]/5 px-[3mm] py-[0.5mm] rounded-full">
            <div className="text-[6pt] text-[#1a2b4c] font-bold whitespace-nowrap">
              Sch. No. {student.scholar_no || '—'}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full mt-[2mm] mb-[1.5mm] flex items-center gap-[1.5mm]">
          <div className="flex-1 h-[0.5px] bg-slate-200" />
          <div className="w-[2mm] h-[2mm] rounded-full bg-[#0d9488] shrink-0" />
          <div className="flex-1 h-[0.5px] bg-slate-200" />
        </div>

        {/* Details */}
        <div className="w-full space-y-[1.5mm] flex flex-col justify-center flex-1">
          <DetailRow label="Name" value={student.name} />
          <DetailRow label="Father" value={student.father_name || '—'} />
          <DetailRow label="Class" value={student.classInfo || '—'} />
          <DetailRow label="Roll No" value={student.roll || '—'} />
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div className="shrink-0 z-20">
        {/* Principal signature */}
        <div className="flex justify-end items-end px-[4mm] pb-[1mm]">
          <div className="text-center">
            <svg className="h-[3mm] text-green-700 opacity-60" viewBox="0 0 80 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 20 Q15 2 25 12 Q35 22 45 8 Q55 -2 65 14 Q72 22 78 16" strokeLinecap="round" />
            </svg>
            <div className="text-[6pt] font-extrabold text-[#1a2b4c] border-t border-[#1a2b4c] pt-[0.5mm] px-[3mm]">
              {principalName}
            </div>
          </div>
        </div>
        {/* Bottom dark blue band */}
        <div className="bg-[#1a2b4c] text-white text-center py-[2mm] w-full">
          <div className="text-[7pt] font-black tracking-[0.15em] uppercase font-serif">
            Tikuriyatola, Satna
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center text-[7pt]">
      <span className="w-[14mm] shrink-0 text-slate-500 font-medium">{label}</span>
      <span className="text-slate-400 font-bold mx-[1mm]">:</span>
      <span className="font-bold text-slate-900 truncate">{value}</span>
    </div>
  );
}

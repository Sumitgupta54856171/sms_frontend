import  { useState } from 'react';
import { X, Printer, ArrowLeft, GraduationCap, FileText } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TCForm() {
  const [isOpen, setIsOpen] = useState(true);
  const [tcData, setTcData] = useState(null); // Preview data

  const handleGenerateTC = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setTcData(data);
  };

  const handlePrint = () => {
    window.print();
  };

  const closeApp = () => {
    setIsOpen(false);
    setTcData(null);
  };

  if (!isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 print:hidden">
        <Button onClick={() => setIsOpen(true)} className="bg-[#0d9488] hover:bg-teal-700 text-white">Create Transfer Certificate</Button>
      </div>
    );
  }

 
  if (tcData) {
    return (
      <div className="min-h-screen bg-slate-200 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0 flex flex-col items-center">
        
        {/* CSS for forcing A5 size printing (Half A4) and colors */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A5 portrait; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}} />

        {/* Action Bar (Hidden in Print) */}
        <div className="w-full max-w-[148mm] mb-6 flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => setTcData(null)} className="gap-2 bg-white">
            <ArrowLeft className="h-4 w-4" /> Edit
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="gap-2 bg-teal-700 hover:bg-teal-800 text-white">
              <Printer className="h-4 w-4" /> Print TC
            </Button>
          </div>
        </div>

        {/* --- ACTUAL TC PAPER DESIGN (A5 Dimensions approx 148 x 210 mm) --- */}
        <div className="w-full max-w-[148mm] bg-[#fdfbf7] p-6 shadow-2xl border-[6px] border-double border-teal-800 text-slate-900 print:shadow-none relative">
          
          {/* Header */}
          <div className="text-center border-b-[3px] border-teal-800 pb-3 mb-4 relative">
            <div className="absolute left-0 top-0 text-teal-800 opacity-20">
              <GraduationCap className="w-16 h-16" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 tracking-widest uppercase">School</h2>
            <h1 className="text-2xl font-black text-teal-900 uppercase mt-1 leading-tight font-serif">
              Rose Convent High School
            </h1>
            <p className="text-sm font-bold text-slate-800 mt-1">Delaura Satna (M.P)</p>
            
            <div className="mt-3 inline-block border-2 border-teal-800 px-4 py-1 bg-teal-50 rounded-sm">
              <h3 className="font-extrabold text-base tracking-widest text-teal-900 uppercase">Transfer Certificate</h3>
            </div>
          </div>

          {/* Top Numbers Row */}
          <div className="flex justify-between items-center text-xs font-bold mb-4">
            <div className="flex gap-2 w-1/3"><span>Sch. No.</span> <span className="border-b border-dotted border-slate-600 flex-grow text-center text-teal-900">{tcData.schNo}</span></div>
            <div className="flex gap-2 w-1/3 px-2"><span>Book No.</span> <span className="border-b border-dotted border-slate-600 flex-grow text-center text-teal-900">{tcData.bookNo}</span></div>
            <div className="flex gap-2 w-1/3 text-right"><span>T.C. No.</span> <span className="border-b border-dotted border-slate-600 flex-grow text-center text-teal-900">{tcData.tcNo}</span></div>
          </div>

          {/* Reusable row component for the dotted line effect */}
          <div className="space-y-3 text-[13px] leading-tight font-medium">
            
            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Name of Pupil</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.pupilName}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Date of Birth (if figures and words)</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">
                {tcData.dob} <span className="text-[11px] uppercase ml-1">({tcData.dobWords})</span>
              </span>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">SSSMID NO.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.sssmid}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">AADHAR NO.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.aadhar}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">FAMILY ID No.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.familyId}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">Name of Bank</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.bankName}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">A/c No.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.accountNo}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">IFS CODE</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.ifsc}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Name of Father</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.fatherName}</span>
            </div>
            
            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Name of Mother</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.motherName}</span>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">His/Her Caste</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.caste}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">Place of Birth</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.placeOfBirth}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">Tehsil</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.tehsil}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">Period of Stay in M.P.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.periodStay}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-2/3 items-end gap-2">
                <span className="whitespace-nowrap">Date of Admission</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.dateAdmission}</span>
              </div>
              <div className="flex w-1/3 items-end gap-2">
                <span className="whitespace-nowrap">Adm. Reg. No.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.admRegNo}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Class in which the pupil is admitted</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.classAdmitted}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Date of Leaving the School</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.dateLeaving}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Reason for Leaving</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.reason}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Character</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.character}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Last Examination (with date) Passed</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.lastExam}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Class from which the pupil left</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.classLeft}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Mother Tongue</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.motherTongue}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Other Particulars, if any</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.otherParticulars}</span>
            </div>

          </div>

          {/* Footer Area */}
          <div className="flex justify-between items-end mt-12 text-sm font-bold">
            <div className="flex gap-2 items-end">
              <span>Date</span>
              <span className="border-b border-dotted border-slate-600 w-24 text-center text-teal-900">{tcData.issueDate}</span>
            </div>
            
            <div className="text-center">
              <div className="w-40 border-b border-dotted border-slate-600 mb-1"></div>
              <p>Signature and Seal of</p>
              <p>Head of the School</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DATA ENTRY FORM
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Transfer Certificate Form</h2>
              <p className="text-xs text-slate-500">Fill all details accurately as per school records.</p>
            </div>
          </div>
          <button onClick={closeApp} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="tc-form" onSubmit={handleGenerateTC} className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-white">
          
          {/* Section 1: TC IDs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg border border-teal-100 bg-teal-50/30">
            <div><Label className="mb-1.5 block">Sch. No.</Label><Input name="schNo" placeholder="e.g. 101" required /></div>
            <div><Label className="mb-1.5 block">Book No.</Label><Input name="bookNo" placeholder="e.g. 12" required /></div>
            <div><Label className="mb-1.5 block">T.C. No.</Label><Input name="tcNo" placeholder="e.g. 51" required /></div>
          </div>

          {/* Section 2: Personal & Parents */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Student & Parents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><Label className="mb-1.5 block">Name of Pupil</Label><Input name="pupilName" placeholder="Full Name" required /></div>
              <div><Label className="mb-1.5 block">Date of Birth (Figures)</Label><Input name="dob" type="date" required /></div>
              <div><Label className="mb-1.5 block">Date of Birth (in Words)</Label><Input name="dobWords" placeholder="e.g. First May Two Thousand" required /></div>
              <div><Label className="mb-1.5 block">Name of Father</Label><Input name="fatherName" required /></div>
              <div><Label className="mb-1.5 block">Name of Mother</Label><Input name="motherName" required /></div>
              <div><Label className="mb-1.5 block">His/Her Caste</Label><Input name="caste" placeholder="e.g. General / OBC" required /></div>
              <div><Label className="mb-1.5 block">Place of Birth</Label><Input name="placeOfBirth" required /></div>
              <div><Label className="mb-1.5 block">Tehsil</Label><Input name="tehsil" required /></div>
              <div><Label className="mb-1.5 block">Period of Stay in M.P.</Label><Input name="periodStay" placeholder="e.g. 10 Years / Since Birth" required /></div>
              <div><Label className="mb-1.5 block">Mother Tongue</Label><Input name="motherTongue" placeholder="e.g. Hindi" required /></div>
            </div>
          </div>

          {/* Section 3: IDs & Bank */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Identification & Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label className="mb-1.5 block">SSSMID NO.</Label><Input name="sssmid" /></div>
              <div><Label className="mb-1.5 block">AADHAR NO.</Label><Input name="aadhar" /></div>
              <div><Label className="mb-1.5 block">FAMILY ID No.</Label><Input name="familyId" /></div>
              <div><Label className="mb-1.5 block">Name of Bank</Label><Input name="bankName" /></div>
              <div><Label className="mb-1.5 block">A/c No.</Label><Input name="accountNo" /></div>
              <div><Label className="mb-1.5 block">IFS CODE</Label><Input name="ifsc" /></div>
            </div>
          </div>

          {/* Section 4: Academic Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label className="mb-1.5 block">Date of Admission</Label><Input name="dateAdmission" type="date" required /></div>
              <div><Label className="mb-1.5 block">Admission Reg. No.</Label><Input name="admRegNo" required /></div>
              <div><Label className="mb-1.5 block">Class Admitted in</Label><Input name="classAdmitted" placeholder="e.g. Class 1" required /></div>
              <div><Label className="mb-1.5 block">Date of Leaving School</Label><Input name="dateLeaving" type="date" required /></div>
              <div><Label className="mb-1.5 block">Class from which pupil left</Label><Input name="classLeft" placeholder="e.g. Class 10" required /></div>
              <div><Label className="mb-1.5 block">Reason for Leaving</Label><Input name="reason" placeholder="e.g. Passed / Parent's Transfer" required /></div>
              <div><Label className="mb-1.5 block">Last Exam Passed (with date)</Label><Input name="lastExam" placeholder="e.g. AISSE March 2026" required /></div>
              <div><Label className="mb-1.5 block">Character</Label><Input name="character" placeholder="e.g. Good" defaultValue="Good" required /></div>
              <div className="md:col-span-2"><Label className="mb-1.5 block">Other Particulars, if any</Label><Input name="otherParticulars" placeholder="e.g. N/A" defaultValue="N/A" /></div>
              <div><Label className="mb-1.5 block">Date of Issue (TC Date)</Label><Input name="issueDate" type="date" required /></div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" onClick={closeApp}>Cancel</Button>
          <Button type="submit" form="tc-form" className="bg-[#0d9488] hover:bg-teal-700 text-white">Preview & Generate</Button>
        </div>

      </div>
    </div>
  );
}
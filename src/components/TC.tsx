import React, { useState, useEffect } from 'react';
import { X, Printer, ArrowLeft, FileText } from 'lucide-react';

// --- UI Component Mocks for Standalone Runnable Preview ---
const Label = ({ children, className }: any) => <label className={`text-sm font-medium text-slate-700 ${className}`}>{children}</label>;
const Input = ({ className, ...props }: any) => <input className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Button = ({ children, onClick, className, variant, type, form }: any) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2";
  const variantClass = variant === 'ghost' ? 'hover:bg-slate-100 hover:text-slate-900' : variant === 'outline' ? 'border border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 text-white hover:bg-slate-900/90';
  return <button type={type || "button"} form={form} onClick={onClick} className={`${base} ${variantClass} ${className}`}>{children}</button>;
};

// Mocking API dependency
const fetchBankDetails = async (id: number) => ({ bankName: "SBI Bank", accountNo: "1234567890", ifscCode: "SBIN0001234" });

interface TCStudent {
  id: number;
  name: string;
  father_name?: string;
  mother_name?: string;
  sssmid?: string;
  aadhaar?: string;
  apaarId?: string;
  penId?: string;
  dob?: string;
  classInfo?: string;
  scholar_no?: string;
  caste?: string;
  placeOfBirth?: string;
  tehsil?: string;
  motherTongue?: string;
  dateAdmission?: string;
  classAdmitted?: string;
  classLeft?: string;
  scholar_no?: string;
}

interface TCFormProps {
  student?: TCStudent;
}

// Default mock student for testing
const defaultStudent: TCStudent = {
  id: 1,
  name: "Rahul Kumar",
  father_name: "Suresh Kumar",
  mother_name: "Anita Devi",
  dob: "2010-05-15",
  sssmid: "12345678",
  aadhaar: "1234 5678 9012",
  apaarId: "",
  penId: "",
  caste: "General",
  placeOfBirth: "Satna",
  tehsil: "Satna",
  motherTongue: "Hindi",
  dateAdmission: "2018-04-01",
  classAdmitted: "Grade 5",
  classLeft: "Grade 10",
  scholar_no: "SCH001",
};

export default function TCForm({ student = defaultStudent }: TCFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [tcData, setTcData] = useState<any>(null); // Preview data
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNo: "",
    ifscCode: "",
  });
  const [loadingBank, setLoadingBank] = useState(false);

  useEffect(() => {
    if (!student?.id) return;
    setLoadingBank(true);
    fetchBankDetails(student.id)
      .then((data) => {
        if (data) {
          setBankData({
            bankName: data.bankName || "",
            accountNo: data.accountNo || "",
            ifscCode: data.ifscCode || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBank(false));
  }, [student?.id]);

  const handleGenerateTC = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
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

  // ==========================================
  // PREVIEW / PRINT SCREEN
  // ==========================================
  if (tcData) {
    return (
      <div className="min-h-screen bg-slate-200 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0 print:min-h-0 print:h-auto flex flex-col items-center">
        
        {/* Print CSS — A5 perfect fit */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { 
              size: A5 portrait;
              margin: 0; 
            }
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body * { 
              visibility: hidden; 
            }
            #tc-print-container, #tc-print-container * { 
              visibility: visible; 
            }
            #tc-print-container { 
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 6mm !important;
              box-shadow: none !important;
              width: 148mm !important;
              height: 210mm !important;
              max-width: 148mm !important;
              max-height: 210mm !important;
              min-height: 210mm !important;
              border-width: 4px !important;
              overflow: hidden !important;
            }
            #print-action-bar { display: none !important; }
          }
        `}} />

        {/* Action Bar (Hidden in Print via CSS ID and print:hidden) */}
        <div id="print-action-bar" className="w-full max-w-[148mm] mb-6 flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => setTcData(null)} className="gap-2 bg-white shadow-sm">
            <ArrowLeft className="h-4 w-4" /> Edit
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="gap-2 bg-teal-700 hover:bg-teal-800 text-white shadow-sm">
              <Printer className="h-4 w-4" /> Print TC
            </Button>
          </div>
        </div>

        {/* --- ACTUAL TC PAPER DESIGN (A5: 148 x 210 mm) --- */}
        <div 
          id="tc-print-container" 
          className="w-full max-w-[148mm] bg-[#fdfbf7] p-[6mm] shadow-2xl border-[6px] border-double border-teal-800 text-slate-900 relative min-h-[210mm] box-border flex flex-col"
        >
          
          {/* Header */}
          <div className="text-center border-b-[3px] border-teal-800 pb-2 mb-2">
            <h2 className="text-[12px] font-bold text-slate-700 tracking-widest uppercase">School</h2>
            <h1 className="text-[20px] font-black text-teal-900 uppercase mt-0.5 leading-tight font-serif tracking-wide flex items-center justify-center gap-2">
            <img src="/LOGO.jpg.jpeg" alt="School Logo" className="h-16 w-16 object-cover rounded-full border border-slate-300 shadow-sm" />
            <span>Rose Convent High School</span>
            </h1>
            <p className="text-[12px] font-bold text-slate-800 mt-0.5">Delaura Satna (M.P)</p>
            
            <div className="mt-2 inline-block border-2 border-teal-800 px-4 py-[1px] bg-teal-50 rounded-sm">
              <h3 className="font-extrabold text-[14px] tracking-widest text-teal-900 uppercase">Transfer Certificate</h3>
            </div>
          </div>

          {/* Top Numbers Row */}
          <div className="flex justify-between items-center text-[11px] font-bold mb-2">
            <div className="flex gap-2 w-1/3"><span>Sch. No.</span> <span className="border-b border-dotted border-slate-600 flex-grow text-center text-teal-900">{tcData.schNo}</span></div>
            <div className="flex gap-2 w-1/3 px-2"><span>Book No.</span> <span className="border-b border-dotted border-slate-600 flex-grow text-center text-teal-900">{tcData.bookNo}</span></div>
            <div className="flex gap-2 w-1/3 justify-end text-right"><span>T.C. No.</span> <span className="border-b border-dotted border-slate-600 w-12 text-center text-teal-900">{tcData.tcNo}</span></div>
          </div>

          {/* Content rows — flex-1 pushes footer to bottom */}
          <div className="flex-1 space-y-[8px] text-[12px] leading-tight font-medium">
            
            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Name of Pupil</span>
              <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.pupilName}</span>
            </div>

            <div className="flex w-full items-end gap-2">
              <span className="whitespace-nowrap">Date of Birth (in figures and words)</span>
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
                <span className="whitespace-nowrap">APAAR ID</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.apaarId}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">PEN ID</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.penId}</span>
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
                <span className="whitespace-nowrap">Stay in M.P.</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.periodStay}</span>
              </div>
            </div>

            <div className="flex w-full items-end gap-4">
              <div className="flex w-1/2 items-end gap-2">
                <span className="whitespace-nowrap">Date of Admission</span>
                <span className="flex-grow border-b-[1.5px] border-dotted border-slate-500 text-teal-900 font-bold px-2">{tcData.dateAdmission}</span>
              </div>
              <div className="flex w-1/2 items-end gap-2">
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

          {/* Footer Area — pushed to bottom by flex-1 above */}
          <div className="flex justify-between items-end mt-2 text-[12px] font-bold">
            <div className="flex gap-2 items-end w-1/2">
              <span>Date</span>
              <span className="border-b border-dotted border-slate-600 flex-grow text-center text-teal-900 px-2">{tcData.issueDate}</span>
            </div>
            
            <div className="text-center">
              <div className="w-36 border-b border-dotted border-slate-600 mb-1"></div>
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
              <div className="md:col-span-2"><Label className="mb-1.5 block">Name of Pupil</Label><Input name="pupilName" placeholder="Full Name" defaultValue={student?.name || ''} required /></div>
              <div><Label className="mb-1.5 block">Date of Birth (Figures)</Label><Input name="dob" type="date" defaultValue={student?.dob?.split('T')[0] || ''} required /></div>
              <div><Label className="mb-1.5 block">Date of Birth (in Words)</Label><Input name="dobWords" placeholder="e.g. First May Two Thousand" required /></div>
              <div><Label className="mb-1.5 block">Name of Father</Label><Input name="fatherName" defaultValue={student?.father_name || ''} required /></div>
              <div><Label className="mb-1.5 block">Name of Mother</Label><Input name="motherName" defaultValue={student?.mother_name || ''} required /></div>
              <div><Label className="mb-1.5 block">His/Her Caste</Label><Input name="caste" placeholder="e.g. General / OBC" defaultValue={student?.caste || ''} required /></div>
              <div><Label className="mb-1.5 block">Place of Birth</Label><Input name="placeOfBirth" defaultValue={student?.placeOfBirth || ''} required /></div>
              <div><Label className="mb-1.5 block">Tehsil</Label><Input name="tehsil" defaultValue={student?.tehsil || ''} required /></div>
              <div><Label className="mb-1.5 block">Period of Stay in M.P.</Label><Input name="periodStay" placeholder="e.g. 10 Years / Since Birth" required /></div>
              <div><Label className="mb-1.5 block">Mother Tongue</Label><Input name="motherTongue" placeholder="e.g. Hindi" defaultValue={student?.motherTongue || ''} required /></div>
            </div>
          </div>

          {/* Section 3: IDs & Bank */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Identification & Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label className="mb-1.5 block">SSSMID NO.</Label><Input name="sssmid" defaultValue={student?.sssmid || ''} /></div>
              <div><Label className="mb-1.5 block">AADHAR NO.</Label><Input name="aadhar" defaultValue={student?.aadhaar || ''} /></div>
              <div><Label className="mb-1.5 block">APAAR ID</Label><Input name="apaarId" defaultValue={student?.apaarId || ''} /></div>
              <div><Label className="mb-1.5 block">PEN ID</Label><Input name="penId" defaultValue={student?.penId || ''} /></div>
              <div><Label className="mb-1.5 block">FAMILY ID No.</Label><Input name="familyId" /></div>
              <div><Label className="mb-1.5 block">Name of Bank</Label><Input name="bankName" defaultValue={bankData.bankName} /></div>
              <div><Label className="mb-1.5 block">A/c No.</Label><Input name="accountNo" defaultValue={bankData.accountNo} /></div>
              <div><Label className="mb-1.5 block">IFS CODE</Label><Input name="ifsc" defaultValue={bankData.ifscCode} /></div>
            </div>
          </div>

          {/* Section 4: Academic Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label className="mb-1.5 block">Date of Admission</Label><Input name="dateAdmission" type="date" defaultValue={student?.dateAdmission || ''} required /></div>
              <div><Label className="mb-1.5 block">Admission Reg. No.</Label><Input name="admRegNo" defaultValue={student?.scholar_no || ''} required /></div>
              <div><Label className="mb-1.5 block">Class Admitted in</Label><Input name="classAdmitted" placeholder="e.g. Class 1" defaultValue={student?.classAdmitted || ''} required /></div>
              <div><Label className="mb-1.5 block">Date of Leaving School</Label><Input name="dateLeaving" type="date" required /></div>
              <div><Label className="mb-1.5 block">Class from which pupil left</Label><Input name="classLeft" placeholder="e.g. Class 10" defaultValue={student?.classLeft || student?.classInfo?.split(' ').slice(0,2).join(' ') || ''} required /></div>
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
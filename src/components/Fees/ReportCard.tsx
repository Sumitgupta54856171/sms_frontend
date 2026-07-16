import { useState } from "react";
import { Printer, ArrowLeft, GraduationCap, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubjectsForClass } from "@/api/subject";

interface ReportCardStudent {
  id: number;
  name: string;
  scholarNo: string;
  rollNo: string;
  className: string;
  section?: string;
  parent?: string;
  phone?: string;
}

interface SubjectMarks {
  subject: string;
  code: string;
  maxMarks: number;
  obtained: string;
  grade: string;
}

const GRADE_MAP: Record<string, { min: number; grade: string; remark: string }> = {
  A1: { min: 91, grade: "A1", remark: "Outstanding" },
  A2: { min: 81, grade: "A2", remark: "Excellent" },
  B1: { min: 71, grade: "B1", remark: "Very Good" },
  B2: { min: 61, grade: "B2", remark: "Good" },
  C1: { min: 51, grade: "C1", remark: "Fair" },
  C2: { min: 41, grade: "C2", remark: "Average" },
  D:  { min: 33, grade: "D",  remark: "Below Average" },
  E:  { min: 0,  grade: "E",  remark: "Needs Improvement" },
};

function getGrade(percentage: number): { grade: string; remark: string } {
  for (const key of ["A1", "A2", "B1", "B2", "C1", "C2", "D", "E"] as const) {
    if (percentage >= GRADE_MAP[key].min) return GRADE_MAP[key];
  }
  return GRADE_MAP.E;
}

export default function ReportCard() {
  const studentData = sessionStorage.getItem("reportCardStudent");
  const student: ReportCardStudent | null = studentData ? JSON.parse(studentData) : null;

  const [examType, setExamType] = useState("Annual Examination");
  const [subjects, setSubjects] = useState<SubjectMarks[]>(() => {
    if (!student) return [];
    const classSubjects = getSubjectsForClass(student.className);
    return classSubjects.map((s) => ({
      subject: s.name,
      code: s.code,
      maxMarks: 100,
      obtained: "",
      grade: "",
    }));
  });

  const handleMarksChange = (index: number, value: string) => {
    const updated = [...subjects];
    updated[index].obtained = value;

    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= updated[index].maxMarks) {
      const pct = (num / updated[index].maxMarks) * 100;
      const { grade } = getGrade(pct);
      updated[index].grade = grade;
    } else {
      updated[index].grade = "";
    }
    setSubjects(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalObtained = subjects.reduce((sum, s) => sum + (parseFloat(s.obtained) || 0), 0);
  const totalMax = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = totalMax > 0 ? getGrade(overallPct) : { grade: "-", remark: "" };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">No Student Selected</h2>
          <p className="text-slate-500 mt-2">Please select a student from the Fee Management page.</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans print:p-0 print:bg-white">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Action Bar */}
      <div className="no-print w-full max-w-5xl flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handlePrint} className="gap-2 bg-teal-700 hover:bg-teal-800 text-white shadow-md rounded-full px-6">
          <Printer className="h-4 w-4" /> Print Report Card
        </Button>
      </div>

      {/* Report Card */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:rounded-none print:p-6 print:max-w-full">
        
        {/* School Header */}
        <div className="text-center border-b-2 border-slate-200 pb-6 mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Rose Convent High School
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            <MapPin className="h-3.5 w-3.5 inline" /> Delaura, Satna (M.P.) &nbsp;|&nbsp;
            <Phone className="h-3.5 w-3.5 inline" /> 9406780812 / 8770986315
          </p>
          <div className="mt-4 inline-block bg-indigo-50 px-8 py-2 rounded-full">
            <h2 className="text-xl font-bold text-indigo-700 tracking-wide uppercase">
              {examType}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-2 font-medium">Session: 2026-2027</p>
        </div>

        {/* Exam Type Selector (hidden in print) */}
        <div className="no-print mb-6 flex items-center gap-4">
          <Label className="text-sm font-medium text-slate-700">Exam Type:</Label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Annual Examination</option>
            <option>Half-Yearly Examination</option>
            <option>Quarterly Examination</option>
            <option>Term I Examination</option>
            <option>Term II Examination</option>
            <option>Pre-Board Examination</option>
          </select>
        </div>

        {/* Student Details */}
        <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-100 print:bg-transparent print:border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <Label className="text-xs text-slate-500">Student Name</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.name}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Class</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.className}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Section</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.section || "A"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Roll No.</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.rollNo}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Scholar No.</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.scholarNo}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Father's Name</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.parent || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Phone</Label>
              <p className="font-semibold text-slate-900 mt-0.5">{student.phone || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Session</Label>
              <p className="font-semibold text-slate-900 mt-0.5">2026-2027</p>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
          <Table>
            <TableHeader className="bg-slate-50 print:bg-slate-100">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 w-12 text-center">#</TableHead>
                <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Max. Marks</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Marks Obtained</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Grade</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((item, index) => {
                const num = parseFloat(item.obtained);
                const pct = !isNaN(num) && item.maxMarks > 0 ? (num / item.maxMarks) * 100 : 0;
                const gradeInfo = !isNaN(num) ? getGrade(pct) : null;

                return (
                  <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50/50 print:hover:bg-transparent">
                    <TableCell className="text-center text-sm text-slate-400 font-mono">{index + 1}</TableCell>
                    <TableCell className="font-medium text-slate-800">{item.subject}</TableCell>
                    <TableCell className="text-center font-medium">{item.maxMarks}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={0}
                        max={item.maxMarks}
                        value={item.obtained}
                        onChange={(e) => handleMarksChange(index, e.target.value)}
                        placeholder="__"
                        className="h-10 w-24 mx-auto bg-transparent border-2 hover:border-slate-300 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 print:border-b print:border-slate-300 print:border-x-0 print:border-t-0 print:rounded-none shadow-none text-center font-semibold text-lg placeholder:text-slate-300"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {item.grade ? (
                        <span className={`inline-flex items-center justify-center h-8 w-10 rounded-md font-bold text-sm ${
                          item.grade === "A1" || item.grade === "A2" ? "bg-green-100 text-green-700" :
                          item.grade === "B1" || item.grade === "B2" ? "bg-blue-100 text-blue-700" :
                          item.grade === "C1" || item.grade === "C2" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {item.grade}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-slate-500">
                      {gradeInfo?.remark || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 print:bg-transparent print:border-slate-200 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <Label className="text-xs text-slate-500">Total Max. Marks</Label>
              <p className="text-2xl font-bold text-slate-900">{totalMax}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Total Obtained</Label>
              <p className="text-2xl font-bold text-indigo-600">{totalObtained.toFixed(1)}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Percentage</Label>
              <p className="text-2xl font-bold text-emerald-600">{overallPct.toFixed(2)}%</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Overall Grade</Label>
              <p className={`text-2xl font-bold ${
                overallGrade.grade === "A1" || overallGrade.grade === "A2" ? "text-green-600" :
                overallGrade.grade === "B1" || overallGrade.grade === "B2" ? "text-blue-600" :
                overallGrade.grade === "C1" || overallGrade.grade === "C2" ? "text-amber-600" :
                "text-red-600"
              }`}>
                {overallGrade.grade}
              </p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 pt-8 flex justify-between items-end px-4 border-t border-slate-100 print:border-slate-200">
          <div className="text-center">
            <div className="w-44 border-t border-slate-300 mb-2"></div>
            <p className="text-sm font-semibold text-slate-600">Class Teacher</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-t border-slate-300 mb-2"></div>
            <p className="text-sm font-semibold text-slate-600">Principal</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-t border-slate-300 mb-2"></div>
            <p className="text-sm font-semibold text-slate-600">Parent's Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
}

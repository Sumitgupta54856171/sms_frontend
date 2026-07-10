import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import TCForm from "@/components/TC";
import { fetchStudentDetail } from "@/api/student";

export default function TCPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => fetchStudentDetail(Number(studentId)),
    enabled: !!studentId,
  });

  const student = detailResponse?.student ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const tcStudent = student
    ? {
        id: student.id,
        name: student.name,
        father_name: student.father_name,
        mother_name: student.mother_name,
        sssmid: student.sssmid,
        aadhaar: student.aadhaar,
        apaarId: student.apaarId,
        penId: student.penId,
        dob: student.dob,
        scholar_no: student.scholar_no,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Transfer Certificate</h1>
              <p className="text-sm text-slate-500">
                Fill in the details to generate a Transfer Certificate
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/profile/${studentId}`)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </button>
        </div>
      </div>
      <TCForm student={tcStudent} />
    </div>
  );
}
